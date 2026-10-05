import { writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const targets = await fetch("http://127.0.0.1:9231/json").then((r) => r.json());
const target = targets.find((entry) => entry.type === "page");
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve) => socket.addEventListener("open", resolve, { once: true }));
const pending = new Map();
const issues = [];
let id = 0;
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (message.id) {
    const request = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
  }
  if (message.method === "Runtime.exceptionThrown") issues.push(message.params.exceptionDetails);
  if (message.method === "Log.entryAdded" && message.params.entry.level === "error") issues.push(message.params.entry);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  pending.set(++id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) => {
  const response = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
  return response.result.value;
};
const shot = async (name) => {
  const { data } = await send("Page.captureScreenshot", { format: "png" });
  await writeFile(`artifacts/work-stream-${name}.png`, Buffer.from(data, "base64"));
};
const scroll = async (y, wait = 900) => {
  await evaluate(`window.scrollTo({top:${y},behavior:'instant'})`);
  await pause(wait);
};
const mode = process.argv[2] || "reference";
const width = Number(process.argv[3] || 1440);
const height = Number(process.argv[4] || 900);
await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");
await send("Emulation.setDeviceMetricsOverride", {width,height,deviceScaleFactor:1,mobile:width<=768});
await send("Emulation.setEmulatedMedia", {features:[{name:"prefers-reduced-motion",value:mode==="reduced"?"reduce":"no-preference"}]});
await send("Page.navigate", {url:mode==="reference"?"https://segerman.dev/":"http://localhost:3000/"});
await pause(mode==="reference"?8000:3500);
if (mode === "reference") {
  console.log(await evaluate("JSON.stringify({text:document.body.innerText.slice(0,1500),images:[...document.images].map(i=>({src:i.currentSrc,classes:i.className,parent:i.parentElement.className})),sections:[...document.querySelectorAll('section')].map(s=>({class:s.className,id:s.id}))})"));
  for (const y of [0,700,1300,1900,2700]) {
    await scroll(y,1800);
    await shot(`reference-${y}`);
  }
} else if (mode === "before") {
  const top = await evaluate("document.querySelector('#work').getBoundingClientRect().top+scrollY");
  await scroll(top-height*0.25,1500);
  await shot("before-entry");
  console.log(await evaluate("JSON.stringify({previous:document.querySelector('#work').previousElementSibling.className,next:document.querySelector('#work').nextElementSibling.className,workTop:document.querySelector('#work').getBoundingClientRect().top,workHeight:document.querySelector('#work').offsetHeight})"));
} else {
  assert.ok(await evaluate("!!document.querySelector('#work')"));
}
console.log(JSON.stringify({mode,issues}));
socket.close();
