// Record the Pegasus 43 page loading on a pretend slow phone and watch the size grid.
// Same Chrome DevTools Protocol calls the DevTools panel (and Chrome DevTools MCP) use.
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const URL = process.argv[2] ?? "http://localhost:3044/";
const OUT = process.argv[3] ?? path.resolve("out");
fs.mkdirSync(path.join(OUT, "frames"), { recursive: true });

const PHONE = { width: 375, height: 812, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
const CPU_SLOWDOWN = 4;
const RTT_MS = 150;
const DOWN_KBPS = 1638.4; // Slow 4G (Lighthouse mobile)
const UP_KBPS = 675; // Lighthouse's upload figure for the same profile
const kbpsToBytes = (k) => (k * 1024) / 8;

const GRID = "div.grid-cols-5.h-\\[328px\\]";

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--no-first-run", "--no-default-browser-check", "--force-device-scale-factor=3"],
});
const ctx = await browser.createBrowserContext(); // fresh: no cache, no cookies
const page = await ctx.newPage();
const cdp = await page.createCDPSession();

await page.setUserAgent(
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
);
await page.setViewport(PHONE);
await cdp.send("Network.enable");
await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
await cdp.send("Network.emulateNetworkConditions", {
  offline: false,
  latency: RTT_MS,
  downloadThroughput: kbpsToBytes(DOWN_KBPS),
  uploadThroughput: kbpsToBytes(UP_KBPS),
});
await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU_SLOWDOWN });

// In the page: sample the grid's box every frame and every DOM change, and log layout shifts.
await page.evaluateOnNewDocument((GRID) => {
  const t0 = performance.timeOrigin;
  window.__samples = [];
  window.__shifts = [];
  let last = "";
  const sample = (why) => {
    const grid = document.querySelector(GRID);
    if (!grid) return;
    const r = grid.getBoundingClientRect();
    const kids = [...grid.children];
    const first = kids[0]?.getBoundingClientRect();
    const lastKid = kids.at(-1)?.getBoundingClientRect();
    const s = {
      top: +(r.top + scrollY).toFixed(2),
      left: +r.left.toFixed(2),
      width: +r.width.toFixed(2),
      height: +r.height.toFixed(2),
      boxes: kids.length,
      firstBox: first && [+first.left.toFixed(2), +(first.top + scrollY).toFixed(2), +first.width.toFixed(2), +first.height.toFixed(2)],
      lastBox: lastKid && [+lastKid.left.toFixed(2), +(lastKid.top + scrollY).toFixed(2), +lastKid.width.toFixed(2), +lastKid.height.toFixed(2)],
      numbers: grid.getAttribute("aria-hidden") === "true" ? "placeholder" : "sizes",
      firstLabel: kids[0]?.textContent?.trim() ?? "",
    };
    const key = JSON.stringify(s);
    if (key !== last) {
      last = key;
      window.__samples.push({ t: +performance.now().toFixed(1), why, ...s });
    }
  };
  const tick = () => {
    sample("frame");
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  new MutationObserver(() => sample("dom")).observe(document, { subtree: true, childList: true, attributes: true });
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      window.__shifts.push({
        t: +e.startTime.toFixed(1),
        value: e.value,
        hadRecentInput: e.hadRecentInput,
        sources: (e.sources || []).map((s) => ({
          node: s.node ? `${s.node.nodeName}.${String(s.node.className || "").slice(0, 60)}` : null,
          from: [s.previousRect.x, s.previousRect.y, s.previousRect.width, s.previousRect.height],
          to: [s.currentRect.x, s.currentRect.y, s.currentRect.width, s.currentRect.height],
        })),
      });
    }
  }).observe({ type: "layout-shift", buffered: true });
  // Thin red outline around the grid so it is easy to watch in the video. Outlines take no space.
  const css = `${GRID}{outline:2px solid #e11d48;outline-offset:3px}`;
  const addCss = () => {
    if (!document.head || document.getElementById("__rec")) return;
    const st = document.createElement("style");
    st.id = "__rec";
    st.textContent = css;
    document.head.appendChild(st);
  };
  new MutationObserver(addCss).observe(document, { subtree: true, childList: true });
}, GRID);

// Video frames.
const frames = [];
cdp.on("Page.screencastFrame", async ({ data, metadata, sessionId }) => {
  const file = path.join(OUT, "frames", `f${String(frames.length).padStart(4, "0")}.jpg`);
  fs.writeFileSync(file, Buffer.from(data, "base64"));
  frames.push({ file, ts: metadata.timestamp });
  await cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
});

await page.goto("about:blank");
await page.tracing.start({ path: path.join(OUT, "trace.json"), screenshots: true });
await cdp.send("Page.startScreencast", { format: "jpeg", quality: 90, everyNthFrame: 1, maxWidth: 1125, maxHeight: 2436 });
const navStart = Date.now() / 1000;

const timing = {};
cdp.on("Network.responseReceived", (e) => {
  if (e.type === "Document") timing.docResponse = e.timestamp;
});

await page.goto(URL, { waitUntil: "networkidle0", timeout: 120000 });
await new Promise((r) => setTimeout(r, 2000));

await cdp.send("Page.stopScreencast");
await page.tracing.stop();

const result = await page.evaluate(() => ({
  samples: window.__samples,
  shifts: window.__shifts,
  nav: performance.getEntriesByType("navigation")[0]?.toJSON(),
  paints: performance.getEntriesByType("paint").map((p) => ({ name: p.name, t: +p.startTime.toFixed(1) })),
  dpr: devicePixelRatio,
  viewport: [innerWidth, innerHeight],
}));
await browser.close();

// Frame list with how long each one stays on screen, for ffmpeg.
const firstTs = frames[0]?.ts ?? navStart;
let concat = "";
frames.forEach((f, i) => {
  const next = frames[i + 1]?.ts ?? f.ts + 0.5;
  concat += `file '${f.file}'\nduration ${Math.max(next - f.ts, 0.001).toFixed(4)}\n`;
});
concat += `file '${frames.at(-1).file}'\n`;
fs.writeFileSync(path.join(OUT, "frames.txt"), concat);
fs.writeFileSync(
  path.join(OUT, "frame-times.json"),
  JSON.stringify(frames.map((f) => ({ file: path.basename(f.file), ms: Math.round((f.ts - firstTs) * 1000) })), null, 1),
);

const settings = { url: URL, phone: PHONE, cpuSlowdown: CPU_SLOWDOWN, rttMs: RTT_MS, downKbps: DOWN_KBPS, upKbps: UP_KBPS };
fs.writeFileSync(path.join(OUT, "result.json"), JSON.stringify({ settings, ...result, frames: frames.length }, null, 2));
console.log(JSON.stringify({ settings, frames: frames.length, ...result }, null, 2));
