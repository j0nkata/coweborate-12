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
const screenshot = async (name) => {
  const { data } = await send("Page.captureScreenshot", { format: "png" });
  await writeFile(`artifacts/selected-work-${name}.png`, Buffer.from(data, "base64"));
};
const scroll = async (y, wait = 1000) => {
  await evaluate(`window.scrollTo({top:${y},behavior:'instant'})`);
  await pause(wait);
};
const measure = () => evaluate(`(() => {
  const rect = (el) => { const r = el.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}; };
  const root = document.querySelector('#work');
  return {scrollY, overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    previous:rect(root.previousElementSibling), section:rect(root), next:rect(root.nextElementSibling),
    pins:root.querySelectorAll('.pin-spacer').length,
    triggers:window.gsap?.core.globals().ScrollTrigger?.getAll().filter(t=>root.contains(t.trigger)).length,
    chapters:[...root.querySelectorAll('[data-project-chapter]')].map(el=>({rect:rect(el),
      visual:rect(el.querySelector('[data-project-visual]')), clip:getComputedStyle(el.querySelector('[data-project-visual]')).clipPath,
      links:[...el.querySelectorAll('a')].map(a=>({href:a.getAttribute('href'),rect:rect(a)})),
      identityOpacity:getComputedStyle(el.querySelector('.project-chapter__identity')).opacity,
      imageReady:el.querySelector('img').complete && el.querySelector('img').naturalWidth>0})),
    progress:root.querySelector('[data-project-progress-index]')?.textContent};
})()`);
await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");
const mode = process.argv[2] || "before";
const width = Number(process.argv[3] || 1440);
const height = Number(process.argv[4] || 900);
await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width <= 768 });
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: mode === "reduced" ? "reduce" : "no-preference" }] });
await send("Page.navigate", { url: process.env.AUDIT_URL || "http://localhost:3000/" });
for (let attempt = 0; attempt < 80; attempt++) {
  await pause(250);
  if (await evaluate("document.readyState==='complete' && !!document.querySelector('#work')")) break;
}
await pause(2500);
const workTop = await evaluate("document.querySelector('#work').getBoundingClientRect().top+scrollY");
await scroll(workTop-height*0.3, 1600);
await screenshot(`${mode}-${width}-entry`);
const reports = [{ stage: "entry", ...await measure() }];
for (let index = 0; index < 3; index++) {
  const y = await evaluate(`document.querySelectorAll('[data-project-chapter]')[${index}].getBoundingClientRect().top+scrollY-80`);
  await scroll(y, 1300);
  await screenshot(`${mode}-${width}-project-${index+1}`);
  reports.push({ stage: `project-${index+1}`, ...await measure() });
}
const nextTop = await evaluate("document.querySelector('#work').nextElementSibling.getBoundingClientRect().top+scrollY");
await scroll(nextTop-height*0.5, 1200);
await screenshot(`${mode}-${width}-exit`);
reports.push({ stage: "exit", ...await measure() });
if (mode !== "before") {
  const lastTop = await evaluate("document.querySelectorAll('[data-project-chapter]')[2].getBoundingClientRect().top+scrollY");
  await scroll(lastTop-height*0.24, 1400);
  reports.push({stage:"reverse-last",...await measure()});
  await screenshot(`${mode}-${width}-reverse-last`);
  await scroll(workTop-300, 20);
  await scroll(nextTop+300, 20);
  await scroll(workTop+200, 1500);
  reports.push({stage:"fast-reverse",...await measure()});
  await send("Emulation.setDeviceMetricsOverride", {width:390,height:844,deviceScaleFactor:1,mobile:true});
  await pause(1400);
  reports.push({stage:"resize-mobile",...await measure()});
  await send("Emulation.setDeviceMetricsOverride", {width,height,deviceScaleFactor:1,mobile:width<=768});
  await pause(1400);
  reports.push({stage:"resize-restore",...await measure()});
  await send("Input.dispatchKeyEvent", {type:"keyDown",key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
  await send("Input.dispatchKeyEvent", {type:"keyUp",key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
  for (let index=0;index<3;index++) {
    await evaluate(`document.querySelectorAll('[data-project-chapter]')[${index}].querySelector('h3 a').focus()`);
    await pause(350);
    reports.push({stage:`keyboard-${index+1}`,focus:await evaluate("({href:document.activeElement.getAttribute('href'),outline:getComputedStyle(document.activeElement).outlineStyle,top:document.activeElement.getBoundingClientRect().top,bottom:document.activeElement.getBoundingClientRect().bottom})")});
  }
  if (mode === "desktop") {
    await send("Input.dispatchKeyEvent", {type:"keyDown",key:"Enter",code:"Enter",windowsVirtualKeyCode:13});
    await send("Input.dispatchKeyEvent", {type:"keyUp",key:"Enter",code:"Enter",windowsVirtualKeyCode:13});
    await pause(1800);
    assert.equal(await evaluate("location.pathname"), "/projects/project-three");
    assert.equal(await evaluate("!!document.querySelector('.case-study')"), true);
    await evaluate("history.back()");
    await pause(2500);
    assert.equal(await evaluate("!!document.querySelector('#work')"), true);
    reports.push({stage:"route-return",...await measure()});
  }
}
const result = {mode,width,height,reports,issues};
await writeFile(`artifacts/selected-work-${mode}-${width}-report.json`,JSON.stringify(result,null,2));
if (mode !== "before") {
  assert.equal(issues.length,0,"Browser errors");
  for (const report of reports) {
    if (report.section) {
      assert.equal(report.overflow,0,`Overflow at ${report.stage}`);
      assert.equal(report.pins,0,`Unexpected project pin at ${report.stage}`);
      assert.ok(Math.abs(report.next.y-report.section.bottom)<1,"Section handoff gap");
    }
    if (/^project-[1-3]$/.test(report.stage)) {
      const index=Number(report.stage.slice(-1))-1;
      assert.ok(report.chapters[index].imageReady,"Visible image not loaded");
      assert.ok(report.chapters[index].visual.width>100 && report.chapters[index].visual.height>100,"Collapsed media");
      assert.equal(report.progress,String(index+1).padStart(2,"0"));
    }
    if (report.focus) {
      assert.equal(report.focus.outline,"solid","Missing focus outline");
      assert.ok(report.focus.top>=0 && report.focus.bottom<=height,"Focus outside viewport");
    }
    if (mode === "reduced" && report.chapters) {
      assert.ok(report.chapters.every(c=>c.clip==="none" && c.identityOpacity==="1"),"Hidden reduced-motion content");
    }
  }
}
console.log(JSON.stringify({mode,width,height,issues,reports:reports.map(r=>({stage:r.stage,overflow:r.overflow,pins:r.pins,triggers:r.triggers,progress:r.progress,focus:r.focus,media:r.chapters?.map(c=>({width:c.visual.width,height:c.visual.height,clip:c.clip,ready:c.imageReady,opacity:c.identityOpacity}))}))}));
socket.close();
