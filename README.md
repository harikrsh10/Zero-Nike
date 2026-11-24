# nike-pegasus-phone-page: Pegasus 43 phone page

A 375 px phone product page for the Nike Pegasus 43 (Black/White-Volt, $140, launches 10 Dec 2026).

- `web/` is the Next.js app. Run it with `npm --prefix web run dev -- -p 3043`.
- `Pegasus 43 size and stock list.json` holds the 26 sizes and their stock.
- `docs/plans/` has the page plan and the size selector plan.
- `docs/recordings/2026-11-24-slow-phone-load/` has the slow-phone load recording.
- `speed-budget.json` is the speed budget the launch check reads.

## Speed budget

[`speed-budget.json`](speed-budget.json) sits at the repo root. It has exactly the three keys from the Web Platform Slow 4G mobile check profile, each set to the profile's required value.

| Key | Value | Measured on this page |
|---|---|---|
| `performance_score_min` | 90 | 99 (local Lighthouse run, see below) |
| `size_grid_shift_px_max` | 0 | 0 px in every run |
| `size_button_min_px` | 44 | 48 (every button is 62 × 48, sold-out ones included) |

The profile allows no extra or missing keys, so the throttle settings live in the check, not in this file.

### Elements the check reads

The page renders all five `data-testid`s the profile lists:

| `data-testid` | On | Count found |
|---|---|---|
| `size-grid` | The size grid. The empty placeholder grid uses the same testid, and only one of the two is ever on the page. | 1 |
| `size-button` | Each in-stock or low-stock size | 22 |
| `size-button-sold-out` | Each sold-out size. These stay in the grid at full size. | 4 |
| `main-photo` | The first photo slide | 1 |
| `price` | The $140 price | 1 |

## Slow-phone load check (24 Nov 2026)

**Settings:**
- Screen: 375 × 812 CSS px at 3x pixel density, with mobile on.
- CPU: 4x slowdown.
- Network: two sets of values, three fresh runs each, against the production build:
  - 150 ms round trip, 1638.4 kbps (the values in the request).
  - 562.5 ms delay per request, 1474.56 kbps (the profile's values for a real slowed browser).

**Result:** the trace reported **0 layout shifts** in every run. From first paint to fully loaded, the top of `size-grid` stayed at 440 px, so it moved 0 px.

At first paint, the grid shows 26 empty grey boxes. About 300 ms later, the size numbers fill the same boxes, and nothing moves. Before the stylesheet arrives, the grid briefly measures 303 px down with no height. The browser draws nothing until the stylesheet loads, so that never reaches the screen.

**Lighthouse:** a local Lighthouse 12.8.2 mobile run with the profile's `lighthouse_settings` scored **99**:
- Cumulative layout shift: 0.
- First contentful paint: 0.8 s.
- Largest contentful paint: 2.0 s.

That run was on the production build on this Mac, not the live Vercel page that the launch check scores.

Files are in `docs/recordings/2026-11-24-slow-phone-load/`:
- videos at real speed and in 4x slow motion
- `filmstrip.png`
- `trace.json`, which opens in Chrome DevTools → Performance
- `results.json`, with every run and the Lighthouse numbers
- `record.mjs`, the script that made the recording

### What could push the size grid down, and the fix in place

| What could load late and push the grid | Watched as | Fix in place |
|---|---|---|
| Shoe photos | `main-photo` | The photo area is a fixed 260 px box. It keeps its height before, during and after the image arrives. |
| The price, or a web font for it, arriving late | `price` | The page uses only phone system fonts, so nothing swaps. The name, colorway, price and rating sit in a fixed 88 px block. |
| W / M / EU switch and the "Select size" row | `size-grid` top | Fixed 48 px row. |
| The sizes themselves, which come in after the page shell | `size-grid` | The shell shows 26 empty boxes of the same size in the same spots. The numbers fill those boxes without moving them. |
| The "Only 3 left" line under the grid | `size-grid` top | Fixed 32 px line that is always there. When it changes, only its text changes. Being below the grid, it couldn't push the grid anyway. |
| Sticky "Notify me" bar, sheets, gallery | `size-grid` top | They sit on top of the page and take no room in it. |

**Still open: real product photos.** Today the largest thing on the first screen is the colorway text, because the shoe is a drawing. The profile expects `main-photo` to be the largest element. When real photos arrive:
- Put them inside the fixed 260 px box (for example `next/image` with `fill` and `priority` on the first one), not at their own natural height.
- Run the recording and Lighthouse again.

### Key Claude Code prompt

> record the loading of the page in a pretend slow font using Chrome Dev Tools MCP. The font screen needs to be 375 x 812 CSS px viewport at 3x pixel density. The slowness should be a 4x CPU slowdown, 150 ms round trip, and we will be looking at the size grid of the size selection so that it's not jumping around and it is staying still. Also the network speed needs to be 1638.4 kbps so that the phone is slow 4G.

**What Claude Code checked and changed:**
- **Reading the prompt.** "Font" was read as "phone"; the page loads no web fonts.
- **Recording tool.** Chrome DevTools MCP wasn't installed in that session. Claude Code drove Chrome with a Puppeteer script that uses the same DevTools throttling calls. The MCP has since been added.
- **First budget file was wrong.** The first `speed-budget.json` held the three throttle values. The mobile check profile requires its three keys instead, so the file was rewritten.
- **Testids.** The five `data-testid`s were added to the page. The recording now finds the grid by `[data-testid="size-grid"]`.
- **Re-measuring.** The page was measured again with both the request's network values and the profile's values.
- **Mismatch in the profile.** The profile's header says to trace at 150 ms / 1638.4 kbps. Its settings block says a real slowed browser should use 562.5 ms / 1474.56 kbps. Both were run, and both gave 0 px.
