# Pegasus 43 product page: 375px phone plan

**Date:** 23 Nov 2026 · **Status:** Draft for approval
**Product:** Nike Pegasus 43, Black/White-Volt (HV7521-001), $140, launches 10 Dec 2026
**Data:** `Pegasus 43 size and stock list.json` (26 sizes: 4 sold out, 5 low stock)
**See also:** [size selector plan](2026-11-23-pegasus-43-size-selector-plan.md) (why the selector never moves, tap sizes, wrong-pick guards)

## Why this page exists

A runner opens the page on her phone. She needs to see the shoe, confirm the price, and pick her size without pinching or zooming. This plan sets the order and the exact size of every part, what she sees before scrolling, and what each scroll shows her.

## Rules for every section

1. **Fixed height.** Every section has a set height in px. Content is cut off with "…" or moved into a sheet; a section never grows.
2. **Fixed order.** Sections appear in the order below on every load. Nothing is added above the size selector after the page first appears.
3. **Thumb-sized targets.** Every tappable control is at least 44 × 44px. Size buttons are 62 × 48px, sold-out ones included.
4. **No pinching.** Photos open in a full-screen gallery; long text opens in a sheet.

## Screen frame

| Item | Value |
|---|---|
| Width | 375px. Side gutters 16px, so content is 343px wide. Photos run edge to edge |
| Visible screen | 664px tall (812px phone minus browser bars) |
| Sticky button bar | 64px plus the phone's bottom safe-area gap, always on top of the page |
| Visible page area above the bar | **600px**. This is one "fold" |
| Full page height | **1,844px** |
| Furthest she can scroll | 1,180px |

---

## Page map: order, position and size

`y` is the distance from the top of the page.

| Order | Section | Starts at y | Ends at y | Height | Where she sees it |
|---|---|---|---|---|---|
| 1 | Header | 0 | 44 | 44 | **Fold 1** |
| 2 | Photos | 44 | 304 | 260 | **Fold 1** |
| 3 | Name, colour, price, rating | 304 | 392 | 88 | **Fold 1** |
| 4 | Sizes | 392 | 880 | 488 | **Fold 1** (header and rows 1–3), then Scroll 1 |
| 5 | Tech details | 880 | 1,232 | 352 | Scroll 1, then Scroll 2 |
| 6 | Reviews | 1,232 | 1,780 | 548 | Scroll 2 |
| — | Bottom spacer (keeps reviews clear of the sticky bar) | 1,780 | 1,844 | 64 | Behind the sticky bar |
| — | Sticky button bar | Pinned to the bottom of the screen | | 64 + safe area | **Always visible** |

```
 y      375px
   0 ┌───────────────────────────┐ ─┐
     │ 1 Header             44   │  │
  44 ├───────────────────────────┤  │
     │ 2 Photos            260   │  │
 304 ├───────────────────────────┤  │  FOLD 1
     │ 3 Name · price       88   │  │  (0–600)
 392 ├───────────────────────────┤  │
     │ 4 Sizes: header + rows 1–3│  │
 600 ├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤ ─┘  [sticky bar covers 600–664 on screen]
     │   Sizes: rows 4–6, status,│ ─┐
     │   size guide              │  │
 880 ├───────────────────────────┤  │  SCROLL 1
     │ 5 Tech details      352   │  │  (600–1,200)
1200 ├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤ ─┘
1232 ├───────────────────────────┤ ─┐
     │ 6 Reviews           548   │  │  SCROLL 2
1780 ├───────────────────────────┤  │  (1,180–1,780, end of page)
     │   spacer             64   │ ─┘
1844 └───────────────────────────┘
```

---

## Fold 1: what she sees the moment the page opens (y 0–600)

Before she touches anything, everything she needs to buy is on screen.

| Order | What | y | Height |
|---|---|---|---|
| 1 | Header: menu, store name, bag | 0–44 | 44 |
| 2 | Photo 1 (side view), "1/6" count, 6 dots | 44–304 | 260 |
| 3 | "Nike Pegasus 43" | 316–340 | 24 |
| 3 | "Black/White-Volt · Launches 10 Dec" | 340–360 | 20 |
| 3 | "$140" and "★★★★★ 4.6 (128)" (taps to Reviews) | 360–384 | 24 |
| 4 | "Select size" and the W / M / EU switch | 392–440 | 48 |
| 4 | Size row 1 | 440–488 | 48 |
| 4 | Size row 2 | 496–544 | 48 |
| 4 | Size row 3 | 552–600 | 48 |
| — | Sticky button: "Notify me · 10 Dec" (before launch) or "Select a size" | on screen 600–664 | 64 |

**Sizes on the first screen** (5 per row, in `display_order`):

| Row | Women's (W) | Men's (M) | EU |
|---|---|---|---|
| 1 | 5 ✕, 5.5 •, 6, 6.5, 7 | 3.5 ✕, 4 •, 4.5, 5, 5.5 | 35.5 ✕ – 38 |
| 2 | 7.5, 8, 8.5, 9, 9.5 | 6, 6.5, 7, 7.5, 8 | 38.5 – 41 |
| 3 | 10, 10.5 •, 11 •, 11.5 ✕, 12 | 8.5, 9 •, 9.5 •, 10 ✕, 10.5 | 42 – 44.5 |

✕ = sold out (greyed, struck through, still tappable for "Notify me") · • = few left (amber dot)

**Note:** in women's sizes the first screen covers W 5–12, which is most runners. In men's it stops at M 10.5, so men in M 11–13 see their size after one short scroll.

## Scroll 1: one thumb-swipe down (page y 600–1,200)

The header has scrolled away. The sticky button stays at the bottom.

| Order | What | y | Height |
|---|---|---|---|
| 4 | Size row 4: W 12.5 •, 13, 13.5, 14, 14.5 (M 11 •, 11.5, 12, 12.5, 13) | 608–656 | 48 |
| 4 | Size row 5: W 15, 15.5, 16, 16.5 •, 17 ✕ (M 13.5–15.5) | 664–712 | 48 |
| 4 | Size row 6: W 17.5 ✕ (M 16) | 720–768 | 48 |
| 4 | Status line, e.g. "W 10.5 · Only 3 left" (always takes its space, empty until she picks) | 780–812 | 32 |
| 4 | "Size guide" link (opens a sheet) | 812–856 | 44 |
| 5 | Grey divider | 880–888 | 8 |
| 5 | "Built for" title | 888–936 | 48 |
| 5 | Spec rows: Drop, Weight, Cushioning, Best for | 936–1,160 | 4 × 56 |
| 5 | Top of the "All details" button | 1,160–1,200 | (first 40 of 48) |

## Scroll 2: the bottom of the page (page y 1,180–1,780)

This is as far as the page scrolls.

| Order | What | y | Height |
|---|---|---|---|
| 5 | "All details" button (opens a sheet) | 1,160–1,208 | 48 |
| 6 | Grey divider | 1,232–1,240 | 8 |
| 6 | "Reviews" title and "128 reviews" | 1,240–1,288 | 48 |
| 6 | Summary: "4.6", stars, fit meter (Small – True – Large) | 1,288–1,360 | 72 |
| 6 | Review card 1: stars, date, title, 3 lines, name and size bought | 1,376–1,528 | 152 |
| 6 | Review card 2 | 1,540–1,692 | 152 |
| 6 | "See all 128 reviews" button (opens a sheet) | 1,708–1,756 | 48 |

---

## Section details

### 1. Header: 44px (y 0–44)

| Piece | Size |
|---|---|
| Menu icon button | 44 × 44 |
| Store name, centred | 15px bold text |
| Bag icon button | 44 × 44 |

Scrolls away with the page. It never stays pinned, so it never takes space from the sizes.

### 2. Photos: 260px (y 44–304)

| Piece | Size / placement |
|---|---|
| Photo area | 375 × 260, edge to edge, light grey background |
| Photos | 6, swipe left and right. Order: side, inner side, top, outsole, heel, upper detail |
| Count "1/6" | Top right, 12px from the edges |
| Dots | 6, centred, 16px from the bottom, inside the 260px |

- The box keeps its size while photos load. A photo never sets the box size.
- Only photo 1 loads straight away; the rest load as she swipes.
- Tapping opens a full-screen gallery where pinch-zoom is allowed.

### 3. Name, colour, price, rating: 88px (y 304–392)

| Piece | Height | Content |
|---|---|---|
| Top padding | 12 | |
| Name | 24 | "Nike Pegasus 43", 20px semibold, one line |
| Colour | 20 | "Black/White-Volt · Launches 10 Dec", 14px grey, one line |
| Price and rating | 24 | "$140" left. Stars, "4.6" and "(128)" right, tap area 44px tall, jumps to Reviews |
| Bottom padding | 8 | |

### 4. Sizes: 488px (y 392–880)

| Piece | y | Height |
|---|---|---|
| "Select size" and W / M / EU switch (each segment 44 × 44) | 392–440 | 48 |
| Grid: 6 rows × 48, 5 gaps × 8 | 440–768 | 328 |
| Gap | 768–780 | 12 |
| Status line | 780–812 | 32 |
| "Size guide" link | 812–856 | 44 |
| Bottom padding | 856–880 | 24 |

**Grid:** 5 columns × 62px with 8px gaps, 26 buttons in `display_order`. The last row has one button, left-aligned.

| Button state | From data | Look | Tap does |
|---|---|---|---|
| Available | `in_stock` | White, thin border | Selects it |
| Few left | `low_stock` | Same plus a 6px amber dot | Selects it; status line shows "Only N left" |
| Sold out | `sold_out` | Grey, faded number, diagonal strike | Opens "Notify me" for that size; doesn't change her pick |
| Selected | — | Black, white number | — |

Every state is the same 62 × 48 size. Rules for loading and wrong-pick protection are in the [size selector plan](2026-11-23-pegasus-43-size-selector-plan.md).

**Size buttons in plain words**

- **Order:** the 26 buttons go from smallest to biggest, five per row, left to right. The first button is women's 5 and the last is women's 17.5.
- **Labels:** each button shows just one number, the size. The W / M / EU switch above the buttons changes every number to match. For example, the first button shows 5 in women's, 3.5 in men's and 35.5 in EU.
- **Sold out (4 sizes):** women's 5, 11.5, 17 and 17.5. These buttons are greyed out with a line through the number. They stay the same size and in the same spot, so nothing moves. Tapping one lets her ask to be told when it's back.
- **Low stock (5 sizes):** women's 5.5, 10.5, 11, 12.5 and 16.5. These look normal but have a small orange dot. When she taps one, the line under the buttons says how many are left, such as "Only 3 left".
- **Everything else (17 sizes):** a normal button with the number.
- **Price and colour:** these are not on the buttons. Every size costs the same ($140) and comes in the same colour (Black/White-Volt), so both are shown once, above the buttons.

### 5. Tech details: 352px (y 880–1,232)

| Piece | y | Height |
|---|---|---|
| Grey divider | 880–888 | 8 |
| "Built for" title | 888–936 | 48 |
| Drop | 936–992 | 56 |
| Weight | 992–1,048 | 56 |
| Cushioning | 1,048–1,104 | 56 |
| Best for | 1,104–1,160 | 56 |
| "All details" button | 1,160–1,208 | 48 |
| Bottom padding | 1,208–1,232 | 24 |

- Each spec row has a label on the left and a value on the right, one line. Values that are too long are cut off with "…".
- "All details" opens a full-height sheet with the longer copy (ride, upper, outsole, fit). The page height never changes.

### 6. Reviews: 548px (y 1,232–1,780)

| Piece | y | Height |
|---|---|---|
| Grey divider | 1,232–1,240 | 8 |
| "Reviews" title and count | 1,240–1,288 | 48 |
| Summary: average, stars, fit meter | 1,288–1,360 | 72 |
| Gap | 1,360–1,376 | 16 |
| Review card 1 | 1,376–1,528 | 152 |
| Gap | 1,528–1,540 | 12 |
| Review card 2 | 1,540–1,692 | 152 |
| Gap | 1,692–1,708 | 16 |
| "See all reviews" button | 1,708–1,756 | 48 |
| Bottom padding | 1,756–1,780 | 24 |

**Each review card (152px):** padding 12 · stars and date 20 · gap 8 · title 20 (one line) · gap 4 · review text 60 (3 lines, cut off with "…") · gap 4 · "Maya K. · Bought W 8" 16 · padding 12.

- The two newest reviews show on the page. The rest are in the "See all" sheet.
- With no reviews yet, the section keeps its 548px and shows: "No reviews yet. Be the first after launch."

### Sticky button bar: 64px plus safe area (always on screen)

The button is 343 × 48, with 8px above and below. It sits on top of the page and never pushes anything.

| Situation | Label | Tap does |
|---|---|---|
| Before 10 Dec, no size | "Notify me · 10 Dec" | Scrolls to the sizes; status line says "Pick a size first" |
| Before 10 Dec, size chosen | "Notify me · W 8" | Opens the notify sheet for that size |
| On sale, no size | "Select a size" | Same as the first row |
| On sale, size chosen | "Add to cart · W 8" | Adds to cart |

---

## Not on the page: sheets that open on top

These open over the page, so they never change any height above.

| Sheet | Opened from | Height |
|---|---|---|
| All details | Tech details button | 88% of the screen |
| All reviews | "See all reviews" | 88% of the screen |
| Size guide (W / M / EU table for all 26 sizes) | "Size guide" link | 88% of the screen |
| Notify me (email) | Sold-out size, or the sticky button before launch | Fits content, up to 88% |
| Photo gallery | Tapping a photo | Full screen |

## Data mapping

| Field in the JSON | Used for |
|---|---|
| `display_order` | Grid order |
| `size_us_women` / `size_us_men` / `size_eu` | Button number for each switch setting |
| `stock_status` | Button state (used as given, not recalculated) |
| `stock_quantity` | "Only N left" |
| `price`, `product_name`, `colorway` | Section 3 |
| `launch_date` | Pre-launch labels |
| `sku` | Add to cart and notify requests |

## Calls I made (check these)

- **The header scrolls away**, so three full rows of sizes fit on the first screen.
- **The photo is 260px tall**, not a taller frame, so sizes appear without scrolling.
- **All 26 sizes show at once**, with no "show more", so no size is ever hidden.
- **Tech details come before reviews.** Reviews are last because the star rating near the price already gives the quick answer, and it jumps straight to them.
- **Bigger text settings.** Heights assume the default text size. If she turns on larger text on her phone, sections may grow; readable text matters more than a fixed height.

## Still needed from the product team

- Rating, review count, fit data and reviews (the build uses placeholders).
- The four spec values and the full tech copy.
- The six photos.
