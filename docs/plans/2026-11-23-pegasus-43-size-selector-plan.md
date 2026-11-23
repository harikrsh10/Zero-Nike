# Pegasus 43 size selector: fixed position and thumb-friendly taps (375px phone)

**Date:** 23 Nov 2026 · **Status:** Draft for approval
**Builds on:** [2026-11-23-pegasus-43-phone-page-plan.md](2026-11-23-pegasus-43-phone-page-plan.md)
**Data:** `Pegasus 43 size and stock list.json` (26 sizes; 4 sold out, 5 low stock), copied to `web/src/data/sizes.json`

## Goal

1. **The size selector never moves.** From first paint until everything has loaded (photos, fonts, ratings, stock and her saved size system), the selector stays where it started: its top edge at **y = 440px** and every button in the same spot.
2. **No accidental or wrong size picks.** Every button is big enough for a thumb, the gaps between buttons are dead zones, and she can always see which size she picked before she buys.

**Why:** if a button moves under her thumb, she taps the wrong size. A wrong size means a return or a lost sale.

## What I measured on the current build (375 × 664)

| Check | Result |
|---|---|
| Layout shifts during load | **0** |
| Grid top | **440px**, as planned |
| Size buttons | All 26 are **62 × 48** |
| W / M / EU switch | **44 × 32: too short.** The only control under 44px |
| Web fonts | None. The page uses the phone's own fonts, so nothing changes when a font loads |
| Real images | None yet. The photos are placeholder drawings |
| **Production HTML** | **Problem.** The first HTML paints the size buttons with **men's** numbers. Her saved choice (for example women's) streams in afterwards and replaces the numbers |

The last row is the serious one. Nothing moves, but on a slow connection she could read "8", tap it thinking it's W 8, and get M 8 (W 9.5). The labels change under her thumb even though the buttons stay put.

## Rules

### A. What keeps the selector in place

Everything above the grid has a fixed height in px, set in the server HTML before anything loads:

| Above the grid | Height | Why it can't move |
|---|---|---|
| Header | 44 | Fixed height. Icons are inline SVG |
| Photos | 260 | A fixed box with a background colour. Images load inside it |
| Name / colour / price / rating | 88 | Each line has a fixed `height` and `line-height` in px. Text that's too long is cut off with "…", never wrapped |
| Size header (title and switch) | 48 | Fixed |
| **Grid top** | **440** | Sum of the four above |

1. **Images.** Real photos use `next/image` with `fill` inside the 260px box, `sizes="100vw"`, `priority` on the first photo only, and the `--photo` grey as background. The box never takes its size from the image.
2. **Fonts.** If a brand font is added, load it with `next/font` (it adjusts the fallback font's size to match) and `display: swap`. Every text line keeps a fixed px `line-height` and `height`, so a font swap can change how wide text is but never how tall. A new font is accepted only if the layout-shift test below still reads 0.
3. **Late data.**
   - The rating loads into a fixed 24px row. While it loads the row is empty but keeps its height.
   - Stock updates only restyle buttons: the low-stock dot is absolutely positioned, and the sold-out look changes colours only.
   - The status line under the grid always reserves its 32px.
4. **Saved size system (the fix for the problem above).** The server HTML must never show size numbers that could change. In the first paint, the grid shows 26 empty, inert boxes at full size (`aria-hidden`, can't be tapped). Numbers appear only once her size system is known. **Rule: a number she can see is never swapped for a different one.**
5. **Nothing gets added above the selector after first paint.** Cookie banners, promo strips and "free shipping" bars either have space reserved in the server HTML or sit on top of the page (fixed or a sheet). They never push the page down.
6. **No `vh` units in the page.** iOS Safari changes `vh` as the address bar shows and hides. Only overlays (sheets, the gallery) may use `dvh`.
7. **The sticky button sits on top of the page.** It's `position: fixed` and covers the page rather than taking up space in it, so showing it or changing its label never moves the grid.

### B. Thumb-friendly targets

| Control | Visible size | Tap area | Gap to next control |
|---|---|---|---|
| Size button | 62 × 48 | 62 × 48 | 8px on all sides (dead zone) |
| W / M / EU segment | **≥ 44 × 44** (fix: 32 → 44 tall) | Same | 2px inside the control |
| Rating link | Text | 44 tall | — |
| "Size guide" | Text | 44 tall, at least 88 wide | 12px from the status line |
| Sticky button | 343 × 48 | Same | 8px |
| Sheet close, header icons | 20px icon | 44 × 44 | — |

- **Size buttons.** 62 × 48px is about 10.5 × 8mm on a 375pt iPhone, above Apple's 44pt minimum and close to Android's 48dp. Their centres are 70px apart across and 56px apart down.
- **Gaps are dead zones on purpose.** Tapping between two sizes selects neither. Tap areas are never stretched into the gaps, because that would make the edge of a tap pick the neighbouring size.
- **The grid sits where a thumb reaches easily.** The first three rows (W 5 to 12) sit at y = 440–600, in the bottom third of the screen, where a right or left thumb reaches comfortably one-handed.

### C. Stopping wrong picks

1. **Select on tap release, not on touch-down.** Use `onClick`. The browser cancels the click if the finger moves, so swiping past the grid while scrolling never selects a size. Use `touch-action: manipulation` to remove the double-tap-zoom delay without turning off scrolling.
2. **Selection follows the SKU, not the button position.** Switching W / M / EU keeps the same shoe selected and relabels it.
3. **She always sees her pick in three places:** the filled button, the status line ("W 10.5 · Only 3 left") and the sticky button ("Add to cart · W 10.5"). If she reads the wrong size, she notices before adding to cart.
4. **Sold-out sizes can't be selected.** Tapping one opens "Notify me" for that size and leaves her current pick unchanged.
5. **Taps before the page is ready are ignored, not guessed.** Until the page's JavaScript has loaded and the grid is ready, the boxes are inert, so an early tap does nothing rather than picking the wrong size.
6. **Tap feedback.** Buttons shrink to 0.97 for 100ms when pressed, and the selected style appears straight away, so she knows the tap landed.
7. **Unchanged:** buttons keep their size and position in every state (available, few left, sold out, selected, loading).

## Build steps (changes to `web/`)

| # | Change | File |
|---|---|---|
| 1 | Make the W / M / EU segments 44px tall: `.segmented` becomes 48px (fills the 48px header row exactly), `.segment` becomes 44px | `pdp.module.css` |
| 2 | Pass a `ready` prop to the size grid. In the Suspense fallback, set `ready={false}`: same 26 boxes, no numbers, `inert`, `aria-hidden` | `page.tsx`, `ProductPage.tsx` |
| 3 | Swap the placeholder drawings for `next/image` with `fill` inside the fixed 260px box. `priority` on photo 1 | `ProductPage.tsx`, `ShoeArt.tsx` |
| 4 | "Size guide" link: `min-width: 88px`, 44px tall | `pdp.module.css` |
| 5 | Add automated checks (below) | `web/tests/` |

## How we check it

Run each check at 375 × 664 on a mid-range phone setting (slow 4G, 4× CPU slowdown).

1. **Grid position.** Record the grid's top at first paint, after fonts finish loading, after every image loads, and after the stream finishes. All four must read **440px**.
2. **Layout shift.** A `PerformanceObserver` collecting `layout-shift` entries must total **0** for the page load.
3. **No label swap.** Load with a saved women's choice. The first visible number in the grid must already be a women's size; record every change to the grid's text and expect none.
4. **Tap sizes.** Every visible `button`, `a` and `input` must be at least 44 × 44, size buttons exactly 62 × 48, and gaps between size buttons at least 8px.
5. **Scroll is not a tap.** Simulate a swipe that starts on a size button. Nothing gets selected.
6. **Sold-out tap.** Select W 8, tap W 11.5 (sold out): the notify sheet opens and W 8 stays selected.
7. **Hand check.** Before release, two people pick a given size one-handed on a real iPhone SE (375pt) and a real Android phone, 10 times each. Target: zero wrong picks.

## Calls I made (check these)

- **Buttons stay 48px tall.** Making them 52px would cut down mis-taps a little, but it pushes the third row below the first screen. I kept 48 with 8px dead-zone gaps, because the gaps do more to stop wrong picks.
- **Empty boxes in the first paint**, instead of guessing a size system and swapping the numbers later.
- **Pick on tap release** (click), never on touch-down.
