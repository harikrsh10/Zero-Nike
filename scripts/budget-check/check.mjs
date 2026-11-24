// Checks a deployed page against speed-budget.json.
// Usage: node check.mjs <url> [out-dir]
// Exits 1 when any budget key fails, so CI marks the deploy red.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";
import puppeteer from "puppeteer-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const url = process.argv[2];
const outDir = path.resolve(process.argv[3] ?? "budget-check-out");
if (!url) throw new Error("Usage: node check.mjs <url> [out-dir]");
fs.mkdirSync(outDir, { recursive: true });

const budget = JSON.parse(fs.readFileSync(path.join(ROOT, "speed-budget.json"), "utf8"));
const { default: lighthouseConfig } = await import(
  path.join(ROOT, "docs/lighthouse/2026-11-24-live-mobile/lighthouse-config.js")
);
const { throttling, screenEmulation } = lighthouseConfig.settings;

// One Lighthouse run swings by several points on a shared CI machine, so score the median of three.
const RUNS = 3;
const runs = [];
for (let i = 0; i < RUNS; i++) {
  const chrome = await chromeLauncher.launch({
    chromePath: process.env.CHROME_PATH,
    chromeFlags: ["--headless=new", "--no-sandbox"],
  });
  try {
    const result = await lighthouse(url, { port: chrome.port, output: ["html", "json"], onlyCategories: ["performance"] }, lighthouseConfig);
    if (result.lhr.runtimeError) throw new Error(`Lighthouse: ${result.lhr.runtimeError.message}`);
    runs.push({ score: Math.round(result.lhr.categories.performance.score * 100), lhr: result.lhr, report: result.report });
  } finally {
    await chrome.kill();
  }
}
const median = [...runs].sort((a, b) => a.score - b.score)[Math.floor(RUNS / 2)];
const { score, lhr } = median;
fs.writeFileSync(path.join(outDir, "lighthouse.html"), median.report[0]);
fs.writeFileSync(path.join(outDir, "lighthouse.json"), median.report[1]);

// Grid movement and button size need a real throttled load, sampled every frame.
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? chromeLauncher.Launcher.getInstallations()[0],
  args: ["--no-sandbox"],
});
let grid;
try {
  const page = await (await browser.createBrowserContext()).newPage();
  const cdp = await page.createCDPSession();
  await page.setViewport({
    width: screenEmulation.width,
    height: screenEmulation.height,
    deviceScaleFactor: screenEmulation.deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
  });
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: throttling.rttMs,
    downloadThroughput: (throttling.throughputKbps * 1024) / 8,
    uploadThroughput: (throttling.uploadThroughputKbps * 1024) / 8,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: throttling.cpuSlowdownMultiplier });
  await page.evaluateOnNewDocument(() => {
    window.__gridTops = [];
    const sample = () => {
      const g = document.querySelector('[data-testid="size-grid"]');
      // Before the stylesheet arrives the grid has no height and nothing is drawn.
      if (g && g.getBoundingClientRect().height > 0) window.__gridTops.push(g.getBoundingClientRect().top + scrollY);
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await page.goto(url, { waitUntil: "networkidle0", timeout: 120_000 });
  await new Promise((r) => setTimeout(r, 1500));
  grid = await page.evaluate(() => {
    const tops = window.__gridTops;
    const buttons = [...document.querySelectorAll('[data-testid="size-button"],[data-testid="size-button-sold-out"]')];
    return {
      found: tops.length > 0,
      shiftPx: tops.length ? Math.max(...tops) - Math.min(...tops) : null,
      buttons: buttons.length,
      smallestButtonPx: buttons.length
        ? Math.min(...buttons.map((b) => Math.min(b.getBoundingClientRect().width, b.getBoundingClientRect().height)))
        : null,
    };
  });
} finally {
  await browser.close();
}

const round = (n) => (n == null ? "not found" : Math.round(n * 10) / 10);
const rows = [
  ["performance_score_min", budget.performance_score_min, score, score >= budget.performance_score_min],
  ["size_grid_shift_px_max", budget.size_grid_shift_px_max, round(grid.shiftPx), grid.found && grid.shiftPx <= budget.size_grid_shift_px_max],
  ["size_button_min_px", budget.size_button_min_px, round(grid.smallestButtonPx), grid.buttons > 0 && grid.smallestButtonPx >= budget.size_button_min_px],
];
const passed = rows.every((r) => r[3]);
const metric = (id) => lhr.audits[id].displayValue;

const summary = [
  `## Speed budget: ${passed ? "pass" : "FAIL"}`,
  "",
  `${url}`,
  "",
  "| Key | Budget | Measured | |",
  "|---|---|---|---|",
  ...rows.map(([key, limit, got, ok]) => `| \`${key}\` | ${limit} | ${got} | ${ok ? "pass" : "**fail**"} |`),
  "",
  `Performance is the median of ${RUNS} runs: ${runs.map((r) => r.score).join(", ")}. Machine benchmark index: ${runs.map((r) => Math.round(r.lhr.environment.benchmarkIndex)).join(", ")} (lower is slower).`,
  "",
  `Median run: first contentful paint ${metric("first-contentful-paint")}, largest contentful paint ${metric("largest-contentful-paint")}, total blocking time ${metric("total-blocking-time")}, layout shift ${metric("cumulative-layout-shift")}.`,
  "",
].join("\n");

console.log(summary);
fs.writeFileSync(path.join(outDir, "summary.md"), summary);
fs.writeFileSync(path.join(outDir, "result.json"), JSON.stringify({ url, passed, score, ...grid, budget }, null, 2));
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
process.exitCode = passed ? 0 : 1;
