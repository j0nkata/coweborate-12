import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";

const mode = process.argv[2] ?? "desktop";
const width = Number(process.argv[3] ?? 1440);
const height = Number(process.argv[4] ?? 900);
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pages = await fetch("http://127.0.0.1:9233/json").then((response) => response.json());
const page = pages.find((entry) => entry.type === "page");
assert.ok(page);
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let id = 0;
const pending = new Map();
const issues = [];
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const handler = pending.get(message.id);
    if (!handler) return;
    pending.delete(message.id);
    message.error ? handler.reject(message.error) : handler.resolve(message.result);
  } else if (message.method === "Runtime.exceptionThrown") {
    issues.push(message.params.exceptionDetails.text);
  } else if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
    issues.push(message.params.entry.text);
  }
});
function send(method, params = {}) {
  const callId = ++id;
  socket.send(JSON.stringify({ id: callId, method, params }));
  return new Promise((resolve, reject) => pending.set(callId, { resolve, reject }));
}
async function evaluate(expression) {
  const response = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
  return response.result.value;
}
async function scroll(y, wait = 380) {
  await evaluate(`scrollTo(0, ${Math.round(y)})`);
  await pause(wait);
}
async function screenshot(name) {
  const response = await send("Page.captureScreenshot", { format: "png" });
  await writeFile(`artifacts/liquid-${mode}-${width}-${name}.png`, Buffer.from(response.data, "base64"));
}
async function measure() {
  return evaluate(`(() => {
    const root = document.querySelector("#work");
    const stage = root.querySelector("[data-work-stage]");
    const canvas = root.querySelector(".selected-projects__webgl");
    const items = [...root.querySelectorAll("[data-work-item]")];
    const matrix = (element) => {
      const value = new DOMMatrixReadOnly(getComputedStyle(element).transform);
      return { a: value.a, b: value.b, c: value.c, d: value.d, e: value.e, f: value.f };
    };
    return {
      mode: root.dataset.workMode,
      webgl: root.dataset.workWebgl,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      canvasCount: root.querySelectorAll(".selected-projects__webgl").length,
      canvas: canvas ? {
        rect: canvas.getBoundingClientRect().toJSON(),
        width: canvas.width,
        height: canvas.height,
      } : null,
      stage: stage.getBoundingClientRect().toJSON(),
      active: items.flatMap((item, index) => item.dataset.active === "true" ? [index] : []),
      items: items.map((item) => {
        const visual = item.querySelector("[data-work-visual]");
        const reveal = item.querySelector("[data-work-reveal]");
        const deform = item.querySelector("[data-work-deform]");
        return {
          visual: matrix(visual),
          deform: matrix(deform),
          revealOpacity: Number(getComputedStyle(reveal).opacity),
          revealVisibility: getComputedStyle(reveal).visibility,
          imageReady: visual.querySelector("img").complete && visual.querySelector("img").naturalWidth > 0,
        };
      }),
    };
  })()`);
}

await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");
await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
await send("Page.navigate", { url: "http://127.0.0.1:3010/" });
for (let attempt = 0; attempt < 80; attempt += 1) {
  await pause(200);
  if (await evaluate(`document.querySelector("#work")?.dataset.workWebgl === "true"`)) break;
}
await pause(700);
issues.length = 0;

const ranges = await evaluate(`[
  ...document.querySelectorAll("[data-work-transition]")
].map((step) => {
  const rect = step.getBoundingClientRect();
  const start = rect.top + scrollY - innerHeight * 0.5;
  return { start, end: start + rect.height };
})`);
assert.equal(ranges.length, 2);
const reports = [];
for (let index = 0; index < ranges.length; index += 1) {
  const range = ranges[index];
  const at = (progress) => range.start + (range.end - range.start) * progress;
  for (const progress of [0.05, 0.3, 0.48, 0.65, 0.95]) {
    await scroll(at(progress));
    const report = await measure();
    reports.push({ index, progress, ...report });
    await screenshot(`t${index + 1}-p${String(progress).replace(".", "")}`);
    assert.equal(report.webgl, "true");
    assert.equal(report.canvasCount, 1);
    assert.equal(report.overflow, 0);
  }
  const end = reports.at(-1);
  assert.deepEqual(end.active, [index + 1]);
  for (const item of end.items) {
    assert.ok(Math.abs(item.visual.a - 1) < 0.002);
    assert.ok(Math.abs(item.visual.f) < 0.1);
    assert.ok(Math.abs(item.deform.a - 1) < 0.002);
    assert.ok(Math.abs(item.deform.b) < 0.002);
    assert.ok(Math.abs(item.deform.d - 1) < 0.002);
  }
}

const first = ranges[0];
for (let cycle = 0; cycle < 3; cycle += 1) {
  for (const progress of [0.95, 0.05]) {
    const destination = first.start + (first.end - first.start) * progress;
    const origin = await evaluate("scrollY");
    for (let step = 1; step <= 7; step += 1) {
      await scroll(origin + (destination - origin) * (step / 7), 18);
    }
    await pause(500);
    const endpoint = await measure();
    assert.deepEqual(endpoint.active, [progress > 0.5 ? 1 : 0]);
    for (const item of endpoint.items) {
      assert.ok(Math.abs(item.visual.f) < 0.1);
      assert.ok(Math.abs(item.deform.a - 1) < 0.002);
      assert.ok(Math.abs(item.deform.b) < 0.002);
      assert.ok(Math.abs(item.deform.d - 1) < 0.002);
    }
  }
}

const frameStats = await evaluate(`new Promise((resolve) => {
  const deltas = [];
  let last = performance.now();
  const sample = (time) => {
    deltas.push(time - last);
    last = time;
    if (deltas.length < 90) requestAnimationFrame(sample);
    else {
      const sorted = deltas.slice(5).sort((a, b) => a - b);
      resolve({ median: sorted[Math.floor(sorted.length * 0.5)], p95: sorted[Math.floor(sorted.length * 0.95)] });
    }
  };
  requestAnimationFrame(sample);
})`);

await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await pause(1000);
const mobile = await measure();
assert.equal(mobile.mode, "flow");
assert.equal(mobile.webgl, undefined);
assert.equal(mobile.canvasCount, 0);
assert.ok(mobile.items.every((item) => item.revealVisibility === "visible"));
assert.equal(mobile.overflow, 0);

await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
await pause(1600);
const resized = await measure();
assert.equal(resized.mode, "desktop");
assert.equal(resized.webgl, "true");
assert.equal(resized.canvasCount, 1);
assert.ok(resized.canvas.width <= resized.canvas.rect.width * 1.5 + 1);

await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
await pause(900);
const reduced = await measure();
assert.equal(reduced.mode, "flow");
assert.equal(reduced.webgl, undefined);
assert.equal(reduced.canvasCount, 0);
assert.ok(reduced.items.every((item) => item.revealVisibility === "visible"));

assert.deepEqual(issues, []);
await writeFile(
  `artifacts/liquid-${mode}-${width}-report.json`,
  JSON.stringify({ mode, width, height, ranges, reports, frameStats, mobile, resized, reduced, issues }, null, 2),
);
console.log(JSON.stringify({ mode, width, height, frameStats, canvas: resized.canvas, issues }));
socket.close();
