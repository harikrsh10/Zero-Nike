# Vercel launch and Lighthouse prompt

## The prompt

> the stock file page should use the Pegasus size and stock snapshot, 8 December 2026. That should be the stock file that needs to be shown so it's showing the right sold-out sizes. The sold-out sizes will be grayed out with a slash mark across them. The size of that button is similar to the other ones.
>
> This needs to run mobile Lighthouse on my live Vercel URL, which is attached below. The report needs to be saved in the repo and it needs to give me the URL back.
>
> https://web-indol-ten-52.vercel.app/

After the first report I followed up with "Yes, fix it", to fix the low-contrast grey text it flagged.

## The launch

The live page is https://web-indol-ten-52.vercel.app/. It's the Vercel project `web`, connected to this repo and building the Next.js app in [`web/`](web/). Every push to `main` deploys to production in about 40 seconds, and Vercel posts a "Deployment has completed" status on the commit.

The page reads [`Pegasus 43 size and stock list.json`](Pegasus%2043%20size%20and%20stock%20list.json) at build time, so new stock goes live with the next deploy. Before each Lighthouse run, Claude Code fetched the live page's CSS until it contained the new change, so the test never ran against the old build.

## The test

Mobile Lighthouse 12.8.2 against the live URL, with the settings from the Web Platform Slow 4G mobile check profile. They're in [`docs/lighthouse/2026-11-24-live-mobile/lighthouse-config.js`](docs/lighthouse/2026-11-24-live-mobile/lighthouse-config.js):

| Setting | Value |
|---|---|
| Form factor | mobile |
| Throttling method | simulate |
| Round trip / throughput | 150 ms / 1638.4 kbps |
| Request latency / download, as applied | 562.5 ms / 1474.56 kbps |
| Upload | 675 kbps |
| CPU slowdown | 4x |
| Screen | 375 × 812 CSS px at 3x, mobile |

From the repo root:

```bash
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npx -y lighthouse@12.8.2 https://web-indol-ten-52.vercel.app/ --config-path=docs/lighthouse/2026-11-24-live-mobile/lighthouse-config.js --output=html --output=json --output-path=docs/lighthouse/2026-11-24-live-mobile/report --chrome-flags="--headless=new"
```

Lighthouse names the output `report.report.html` and `report.report.json`; I renamed them to `report.html` and `report.json`.

## What happened

The live page was already on the 8 Dec snapshot when I asked: 9 sold out, 7 low, 10 in stock, and all 26 buttons at 62 × 48.

The first run scored 100 for performance, best practices and SEO, and 96 for accessibility. The small grey text was `#8a8a8a`, 3.45:1 on white. I changed it to `#6b6b6b` (5.3:1), and the rerun scored 100 in all four.

After that I added "Sold out" and "N left" under the size numbers, in the same 62 × 48 box, and moved the sold-out number to the same `#6b6b6b` so it reads at 4.9:1 on its grey background. Later I added an 8 px gap between the size switch and the grid. The grid still loads with 0 layout shifts. The saved report is from after that change: Performance 99, the rest 100. Three runs in a row gave 99, 99 and 100 for performance.

Then the drawn shoe was replaced with a real photo inside the same 260 px box. The trace still showed 0 layout shifts in all six runs, and the saved report is from that build: Performance 99, the rest 100, with the photo as the largest contentful paint at 1.8 s.

Lighthouse now also runs on every production deploy through the [Speed budget workflow](.github/workflows/speed-budget.yml), which posts a pass or fail status on the commit. See the README for how it works.

The report is online at https://harikrsh10.github.io/nike-pegasus-phone-page/lighthouse/2026-11-24-live-mobile/report.html, with the files in [`docs/lighthouse/2026-11-24-live-mobile/`](docs/lighthouse/2026-11-24-live-mobile/).
