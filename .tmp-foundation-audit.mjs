import { writeFile } from "node:fs/promises";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pages = await fetch("http://127.0.0.1:9230/json").then((response) => response.json());
const page = pages.find((entry) => entry.type === "page" && entry.url.startsWith("http://localhost:3000"));
if (!page) throw new Error("No localhost:3000 page is open in the audit browser.");

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let requestId = 0;
const pending = new Map();
const issues = [];
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const handler = pending.get(message.id);
    if (!handler) return;
    pending.delete(message.id);
    if (message.error) handler.reject(new Error(message.error.message));
    else handler.resolve(message.result);
    return;
  }
  if (message.method === "Runtime.exceptionThrown") {
    issues.push(message.params.exceptionDetails.text);
  }
  if (message.method === "Log.entryAdded" && ["warning", "error"].includes(message.params.entry.level)) {
    issues.push(`${message.params.entry.level}: ${message.params.entry.text}`);
  }
});

const send = (method, params = {}) => new Promise((resolve, reject) => {
  requestId += 1;
  pending.set(requestId, { resolve, reject });
  socket.send(JSON.stringify({ id: requestId, method, params }));
});
const evaluate = async (expression) => {
  const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
};
const screenshot = async (path) => {
  const result = await send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  await writeFile(path, Buffer.from(result.data, "base64"));
};

const [widthArg = "1440", heightArg = "900", label = "foundation"] = process.argv.slice(2);
const width = Number(widthArg);
const height = Number(heightArg);
const mobile = width <= 768;
const reduced = process.argv.includes("--reduce");

await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");
await send("Emulation.setEmulatedMedia", {
  features: [{ name: "prefers-reduced-motion", value: reduced ? "reduce" : "no-preference" }],
});
await send("Emulation.setDeviceMetricsOverride", {
  width,
  height,
  deviceScaleFactor: 1,
  mobile,
  screenWidth: width,
  screenHeight: height,
});
await send("Page.navigate", { url: `http://localhost:3000/?foundation-audit=${Date.now()}` });
for (let count = 0; count < 80; count += 1) {
  await sleep(100);
  const ready = await evaluate("document.readyState === 'complete' && Boolean(document.querySelector('main h1'))");
  if (ready) break;
}
await evaluate("document.fonts.ready.then(() => true)");
await sleep(1800);
await evaluate("window.scrollTo({ top: 0, behavior: 'instant' })");
await sleep(500);
await screenshot(`artifacts/${label}-${width}x${height}-hero.png`);

const outline = await evaluate(`(() => {
  const h1 = document.querySelector('main h1');
  const hero = h1?.closest('section');
  const mainChildren = [...document.querySelector('main').children];
  const heroIndex = mainChildren.indexOf(hero);
  const second = mainChildren[heroIndex + 1];
  const nav = document.querySelector('header');
  const rect = (node) => {
    if (!node) return null;
    const box = node.getBoundingClientRect();
    return { left: box.left, right: box.right, top: box.top + scrollY, bottom: box.bottom + scrollY, width: box.width, height: box.height };
  };
  return {
    url: location.pathname,
    viewport: { width: innerWidth, height: innerHeight },
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    nav: { tag: nav?.tagName, className: nav?.className, box: rect(nav), text: nav?.innerText.trim().replace(/\s+/g, ' ') },
    hero: { tag: hero?.tagName, className: hero?.className, box: rect(hero), text: hero?.innerText.trim().replace(/\s+/g, ' ') },
    second: { tag: second?.tagName, className: second?.className, box: rect(second), text: second?.innerText.trim().replace(/\s+/g, ' ') },
    mainChildren: mainChildren.map((node) => ({ tag: node.tagName, className: node.className, id: node.id, heading: node.querySelector('h1,h2')?.textContent.trim() ?? '' })),
    controls: [...document.querySelectorAll('header a, header button, main section:first-of-type a, main section:first-of-type button')].map((node) => ({ tag: node.tagName, text: node.textContent.trim().replace(/\s+/g, ' '), ariaLabel: node.getAttribute('aria-label'), href: node.getAttribute('href'), box: rect(node) })),
    heroIndex,
  };
})()`);

if (!outline.second?.box) throw new Error("Could not locate the rendered section immediately after the Hero.");
await evaluate(`window.scrollTo({ top: ${Math.max(0, Math.round(outline.second.box.top))}, behavior: 'instant' })`);
await sleep(900);
await screenshot(`artifacts/${label}-${width}x${height}-second-start.png`);
await evaluate(`window.scrollTo({ top: ${Math.max(0, Math.round(outline.second.box.top + Math.min(outline.second.box.height * 0.52, height * 1.6)))}, behavior: 'instant' })`);
await sleep(900);
await screenshot(`artifacts/${label}-${width}x${height}-second-progress.png`);

outline.issues = issues;
console.log(JSON.stringify(outline, null, 2));
socket.close();
setTimeout(() => process.exit(0), 100);
