import { writeFile } from "node:fs/promises";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pages = await fetch("http://127.0.0.1:9230/json").then((response) => response.json());
const page = pages.find((entry) => entry.type === "page" && entry.url === "http://localhost:3000/");

if (!page) throw new Error("No localhost:3000 page is open in the active Chrome session.");

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
  if (message.method === "Log.entryAdded" && ["error", "warning"].includes(message.params.entry.level)) {
    issues.push(`${message.params.entry.level}: ${message.params.entry.text}`);
  }
});

const send = (method, params = {}) => new Promise((resolve, reject) => {
  requestId += 1;
  pending.set(requestId, { resolve, reject });
  socket.send(JSON.stringify({ id: requestId, method, params }));
});

const evaluate = async (expression) => {
  const result = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
};

const reload = async (width, height, mobile = false) => {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
    screenWidth: width,
    screenHeight: height,
  });
  await send("Page.reload", { ignoreCache: true });
  for (let count = 0; count < 40; count += 1) {
    await sleep(150);
    const ready = await evaluate("Boolean(document.querySelector('.hero-editorial[data-hero-ready=\true\]'))");
    if (ready) break;
  }
  await sleep(1400);
};

const inspect = () => evaluate(`(() => {
  const hero = document.querySelector('.hero-editorial');
  const nav = document.querySelector('[data-bottom-nav], .bottom-nav, .fixed-nav');
  const action = hero?.querySelector('.hero-editorial__cta');
  const rect = (selector) => {
    const node = hero?.querySelector(selector);
    if (!node) return null;
    const box = node.getBoundingClientRect();
    return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height };
  };
  const heroStyle = hero ? getComputedStyle(hero) : null;
  return {
    background: heroStyle?.backgroundColor,
    color: heroStyle?.color,
    ready: hero?.dataset.heroReady,
    paragraphs: hero?.querySelectorAll('p').length,
    ctas: [...(hero?.querySelectorAll('a') || [])].map((link) => ({ label: link.textContent.trim(), href: link.getAttribute('href') })),
    primary: rect('[data-hero-primary]'),
    middle: rect('[data-hero-middle]'),
    character: rect('[data-hero-character]'),
    final: rect('[data-hero-final]'),
    media: rect('[data-hero-media-frame]'),
    action: action ? rect('.hero-editorial__cta') : null,
    navTop: nav?.getBoundingClientRect().top ?? null,
    counter: hero?.querySelector('[data-hero-counter]')?.textContent.trim(),
    horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
})()`);

const screenshot = async (path) => {
  const result = await send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
  await writeFile(path, Buffer.from(result.data, "base64"));
};

await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");

const isMobile = process.argv.includes("--mobile");
const viewport = isMobile
  ? { width: 390, height: 844, mobile: true, file: "artifacts/hero-final-live-390x844.png" }
  : { width: 1440, height: 900, mobile: false, file: "artifacts/hero-final-live-1440x900.png" };

await reload(viewport.width, viewport.height, viewport.mobile);
const initial = await inspect();
await screenshot(viewport.file);
await sleep(3400);
const cycled = await inspect();
let scroll = null;

if (!isMobile) {
  await evaluate("window.scrollTo(0, Math.min(window.innerHeight * 0.55, document.documentElement.scrollHeight - window.innerHeight))");
  await sleep(900);
  scroll = await evaluate(`(() => ({
    primary: getComputedStyle(document.querySelector('[data-hero-primary]')).transform,
    middle: getComputedStyle(document.querySelector('[data-hero-middle]')).transform,
    final: getComputedStyle(document.querySelector('[data-hero-final]')).transform,
    manifestoClip: getComputedStyle(document.querySelector('.about-teaser')).clipPath,
  }))()`);
}

console.log(JSON.stringify({ viewport, initial, cycled, scroll, issues }, null, 2));
socket.close();
setTimeout(() => process.exit(0), 100);
