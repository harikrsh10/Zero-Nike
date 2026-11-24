# Vercel launch and Lighthouse prompt

## The prompt I gave Claude Code

> the stock file page should use the Pegasus size and stock snapshot, 8 December 2026. That should be the stock file that needs to be shown so it's showing the right sold-out sizes. The sold-out sizes will be grayed out with a slash mark across them. The size of that button is similar to the other ones.
>
> This needs to run mobile Lighthouse on my live Vercel URL, which is attached below. The report needs to be saved in the repo and it needs to give me the URL back.
>
> https://web-indol-ten-52.vercel.app/

Follow-up prompt, after the first report: "Yes, fix it" (fix the low-contrast grey text the report flagged).

## How the launch is set up

- **Live URL:** https://web-indol-ten-52.vercel.app/
- **Vercel project:** `web`, connected to this GitHub repo (`harikrsh10/nike-pegasus-phone-page`). It builds the Next.js app in [`web/`](web/).
- **Deploys:** every push to `main` starts a production deploy. Vercel posts a "Vercel – Deployment has completed" status on the commit.
- **Stock data:** the page reads [`Pegasus 43 size and stock list.json`](Pegasus%2043%20size%20and%20stock%20list.json) at build time, so a push with new stock is live after the deploy (about 40 s).
- **Checking a deploy is live:** Claude Code fetched the live page's CSS until it held the new change, before running Lighthouse.

## How the test is set up

Mobile Lighthouse 12.8.2, run against the live URL, with the settings from the Web Platform Slow 4G mobile check profile. The settings are in [`docs/lighthouse/2026-11-24-live-mobile/lighthouse-config.js`](docs/lighthouse/2026-11-24-live-mobile/lighthouse-config.js):

| Setting | Value |
|---|---|
| Form factor | mobile |
| Throttling method | simulate |
| Round trip / throughput | 150 ms / 1638.4 kbps |
| Request latency / download (applied) | 562.5 ms / 1474.56 kbps |
| Upload | 675 kbps |
| CPU slowdown | 4x |
| Screen | 375 × 812 CSS px at 3x, mobile |

Command, from the repo root:

```bash
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npx -y lighthouse@12.8.2 https://web-indol-ten-52.vercel.app/ --config-path=docs/lighthouse/2026-11-24-live-mobile/lighthouse-config.js --output=html --output=json --output-path=docs/lighthouse/2026-11-24-live-mobile/report --chrome-flags="--headless=new"
```

Lighthouse names the files `report.report.html` and `report.report.json`; they were renamed to `report.html` and `report.json`.

## Where the results are

- Report online: https://harikrsh10.github.io/nike-pegasus-phone-page/lighthouse/2026-11-24-live-mobile/report.html
- Report files: [`docs/lighthouse/2026-11-24-live-mobile/`](docs/lighthouse/2026-11-24-live-mobile/)
- Scores and what changed: [README](README.md#slow-phone-load-check-24-nov-2026)

## What was checked or changed

1. **Stock file.** The live page already used the 8 Dec snapshot: 9 sold out, 7 low, 10 in stock. All 26 buttons measured 62 × 48 px, sold-out ones included.
2. **First Lighthouse run:** Performance 100, Accessibility 96, Best practices 100, SEO 100. Accessibility lost points on small grey text at 3.45:1 contrast.
3. **Contrast fix.** The small grey went from `#8a8a8a` to `#6b6b6b` (5.3:1 on white). The rerun scored 100 in all four.
4. **Stock in words.** Sold-out buttons now also say "Sold out", and low-stock buttons say "N left", inside the same 62 × 48 box. The sold-out size number went from 40 % black to the same `#6b6b6b` grey, so it reads at 4.9:1 on its grey background. The grid still loads with 0 layout shifts.
