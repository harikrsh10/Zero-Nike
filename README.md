# Pegasus 43 phone page

A product page for the Nike Pegasus 43 (Black/White-Volt, $140, launches 10 Dec 2026), built for a 375 px phone in Next.js and Tailwind.

- Live page: https://web-indol-ten-52.vercel.app/
- Notes page: https://harikrsh10.github.io/nike-pegasus-phone-page/

The thing I cared about most is the size grid. If it moves while the page loads, someone reaching for M 10 taps M 9.5. Most of the layout decisions below exist to keep it still.

| Path | What's there |
|---|---|
| `web/` | The Next.js app. Run it with `npm --prefix web run dev -- -p 3043`. |
| `Pegasus 43 size and stock list.json` | The 26 sizes and their stock, from the 8 Dec 2026 snapshot: 10 in stock, 7 low, 9 sold out, 815 pairs. |
| `speed-budget.json` | The budget the launch check reads. |
| `prompt.md` | The Vercel launch and Lighthouse prompt, and how the launch and the test are set up. |
| `docs/plans/` | The page plan and the size selector plan. |
| `docs/recordings/2026-11-24-slow-phone-load/` | The slow-phone recording and trace. |
| `docs/lighthouse/2026-11-24-live-mobile/` | The Lighthouse report for the live page. |

## Speed budget

```json
{
  "performance_score_min": 95,
  "size_grid_shift_px_max": 0,
  "size_button_min_px": 44
}
```

These are the three keys the Web Platform Slow 4G mobile check profile asks for. The profile rejects extra keys, so the throttle settings live in the check, not here. The profile's minimum score is 90; the page scored 99, so I set the floor at 95.

| Key | Value | Profile minimum | Measured |
|---|---|---|---|
| `performance_score_min` | 95 | 90 | 100 on the live page |
| `size_grid_shift_px_max` | 0 | 0 | 0 px |
| `size_button_min_px` | 44 | 44 | 48. Every size button is 62 × 48, sold-out ones too. |

The check finds elements by `data-testid`. All five are on the page:

| `data-testid` | On | Count |
|---|---|---|
| `size-grid` | The size grid. The empty grid shown while the page streams uses the same testid; only one is ever on the page. | 1 |
| `size-button` | Each size you can buy | 17 |
| `size-button-sold-out` | Each sold-out size | 9 |
| `main-photo` | The first photo | 1 |
| `price` | The $140 price | 1 |

## Slow-phone trace, 24 Nov 2026

I traced the production build in Chrome at 375 × 812 CSS px, 3x pixel density, with a 4x CPU slowdown. The profile gives two network settings, so I ran three fresh loads at each: 150 ms round trip at 1638.4 kbps, and 562.5 ms per request at 1474.56 kbps.

**0 layout shifts in every run.** The top of the size grid stayed at 440 px from first paint to fully loaded.

In the filmstrip, the grid first appears as 26 empty grey boxes. About 300 ms later the size numbers fill the same boxes and nothing moves.

The recording folder has the videos at real speed and 4x slow motion, `filmstrip.png`, `trace.json` (open it in Chrome DevTools, Performance tab), `results.json` with every run, and `record.mjs`, the script that made them.

### What could push the grid down, and what stops it

| Loads late | Watched as | What keeps the grid still |
|---|---|---|
| Shoe photos | `main-photo` | The photo area is a fixed 260 px box, the same height before and after the image arrives. |
| The price, or a web font for it | `price` | The page uses the phone's system fonts, so there's no font swap. Name, colorway, price and rating sit in a fixed 88 px block. |
| The W / M / EU switch and "Select size" row | `size-grid` top | A fixed 48 px row. |
| The sizes, which stream in after the page shell | `size-grid` | The shell already has 26 empty boxes of the same size in the same places. The numbers fill them in. |
| The "Only 3 left" line | `size-grid` top | A fixed 32 px line that's always there; only its text changes. It's under the grid, so it couldn't push it anyway. |
| The sticky "Notify me" bar, sheets and the photo gallery | `size-grid` top | They sit on top of the page and take up no room in it. |

One thing is still open. The shoe is a drawing for now, so the largest thing on the first screen is the colorway text, while the profile expects `main-photo` to be the largest. Real photos need to go inside the 260 px box (`next/image` with `fill`, and `priority` on the first), and then the trace and Lighthouse should run again.

## Lighthouse on the live page

Mobile Lighthouse 12.8.2 on the Vercel URL, with the profile's settings, on 24 Nov 2026:

| Performance | Accessibility | Best practices | SEO |
|---|---|---|---|
| 100 | 100 | 100 | 100 |

First contentful paint 1.1 s, largest contentful paint 1.6 s, total blocking time 60 ms, layout shift 0.

The first run scored 96 for accessibility. The small grey text under the fit scale and on the review bylines was `#8a8a8a`, 3.45:1 on white. It's now `#6b6b6b`, at 5.3:1. I also added "Sold out" and "N left" under the size numbers, so stock isn't shown by colour alone. The buttons stayed 62 × 48.

[Read the report](https://harikrsh10.github.io/nike-pegasus-phone-page/lighthouse/2026-11-24-live-mobile/report.html). [`prompt.md`](prompt.md) has the command and settings to run it again.

## Working with Claude Code

The prompt that set up the trace:

> record the loading of the page in a pretend slow font using Chrome Dev Tools MCP. The font screen needs to be 375 x 812 CSS px viewport at 3x pixel density. The slowness should be a 4x CPU slowdown, 150 ms round trip, and we will be looking at the size grid of the size selection so that it's not jumping around and it is staying still. Also the network speed needs to be 1638.4 kbps so that the phone is slow 4G.

What I checked or changed:

- The first `speed-budget.json` held the throttle settings instead of the profile's three keys. I compared it with the profile and had it rewritten, and renamed the repo to `nike-pegasus-phone-page` to match.
- The page scored 99, so I raised `performance_score_min` from 90 to 95. I left the grid shift at 0 px and the buttons at 44 px.

Claude Code read "font" in my prompt as "phone", which is what I meant. Chrome DevTools MCP wasn't installed when I asked, so it drove Chrome through Puppeteer with the same DevTools throttling calls; I've added the MCP since. It added the five `data-testid`s, and it noticed that the profile's header and its Lighthouse block give different network numbers, which is why both were run. Both gave 0 px.
