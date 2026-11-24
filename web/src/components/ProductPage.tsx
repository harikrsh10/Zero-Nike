"use client";

/*
 * Pegasus 43 product page for a 375px phone.
 * Heights follow docs/plans/2026-11-23-pegasus-43-phone-page-plan.md:
 *   header 44 · photos 260 · title 88 · sizes 488 · tech 352 · reviews 548 · spacer 64
 * First fold (0–600): header, photos, title, size header and size rows 1–3.
 * Tech details and reviews come after the first fold.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Sheet, CloseIcon, iconBtn } from "./Sheet";
import { ShoeArt, photoViews } from "./ShoeArt";
import {
  MODE_COOKIE,
  product,
  ratingSummary,
  reviews,
  sizes,
  specs,
  techCopy,
  type Review,
  type SizeMode,
  type SizeRow,
} from "@/data/product";

export type { SizeMode };

type SheetState =
  | { kind: "tech" }
  | { kind: "reviews" }
  | { kind: "guide" }
  | { kind: "notify"; sku: string; reason: "restock" | "launch" }
  | null;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function saveMode(m: SizeMode) {
  document.cookie = `${MODE_COOKIE}=${m}; path=/; max-age=31536000; samesite=lax`;
}

function formatLaunch(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

/** 5.0 -> "5", 5.5 -> "5.5" */
const num = (n: number) => String(n);

function sizeNumber(row: SizeRow, mode: SizeMode) {
  if (mode === "W") return num(row.size_us_women);
  if (mode === "M") return num(row.size_us_men);
  return row.size_eu;
}

const sizeName = (row: SizeRow, mode: SizeMode) => `${mode} ${sizeNumber(row, mode)}`;

function spokenSize(row: SizeRow, mode: SizeMode) {
  const prefix = mode === "W" ? "US Women" : mode === "M" ? "US Men" : "EU";
  const n = sizeNumber(row, mode);
  if (row.stock_status === "sold_out") return `${prefix} ${n}, sold out`;
  if (row.stock_status === "low_stock") return `${prefix} ${n}, only ${row.stock_quantity} left`;
  return `${prefix} ${n}`;
}

function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span className="tracking-[1px] text-ink" aria-hidden="true">
      {"★".repeat(full)}
      <span className="text-[#cfcfcf]">{"★".repeat(5 - full)}</span>
    </span>
  );
}

/* Shared class strings */
const outlineBtn =
  "h-12 w-full cursor-pointer rounded-full border border-ink bg-white text-[15px] font-semibold";
const primaryBtn =
  "h-12 w-full cursor-pointer touch-manipulation rounded-full border-0 bg-ink text-base font-semibold text-white transition-transform duration-100 active:scale-[0.98] motion-reduce:transition-none";
/** Grey divider (8) + bottom padding (24) = the plan's 32px of padding. */
const sectionBox = "overflow-hidden border-t-8 border-soft px-4 pb-6";

export function ProductPage({
  prelaunch,
  initialMode,
  ready = true,
}: {
  prelaunch: boolean;
  initialMode: SizeMode;
  /** false while her size system is unknown: the grid shows empty, inert boxes. */
  ready?: boolean;
}) {
  const [mode, setMode] = useState<SizeMode>(initialMode);
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [nudge, setNudge] = useState(false);
  const [added, setAdded] = useState(false);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [photo, setPhoto] = useState(0);
  const [gallery, setGallery] = useState<number | null>(null);
  const sizesRef = useRef<HTMLElement>(null);

  const changeMode = (m: SizeMode) => {
    setMode(m);
    saveMode(m);
  };

  const selected = sizes.find((r) => r.sku === selectedSku) ?? null;
  const launch = formatLaunch(product.launchDate);
  const closeSheet = useCallback(() => setSheet(null), []);

  const tapSize = (row: SizeRow) => {
    if (row.stock_status === "sold_out") {
      // Sold-out sizes are never selected; she can ask to be told when it's back.
      setSheet({ kind: "notify", sku: row.sku, reason: "restock" });
      return;
    }
    setSelectedSku(row.sku);
    setNudge(false);
    setAdded(false);
  };

  const tapPrimary = () => {
    if (!selected) {
      setNudge(true);
      sizesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (prelaunch) {
      setSheet({ kind: "notify", sku: selected.sku, reason: "launch" });
      return;
    }
    setAdded(true);
  };

  let primaryLabel: string;
  if (prelaunch) primaryLabel = selected ? `Notify me · ${sizeName(selected, mode)}` : `Notify me · ${launch}`;
  else if (!selected) primaryLabel = "Select a size";
  else primaryLabel = `${added ? "Added to cart" : "Add to cart"} · ${sizeName(selected, mode)}`;

  // Status line under the buttons. "Only N left" shows only for a low-stock pick.
  let status: ReactNode = null;
  if (nudge) status = <span className="font-semibold text-ink">Pick a size first</span>;
  else if (selected?.stock_status === "low_stock")
    status = (
      <span className="font-medium text-[#b45309]">
        {sizeName(selected, mode)} · Only {selected.stock_quantity} left
      </span>
    );
  else if (selected)
    status = (
      <span>
        {sizeName(selected, mode)} · {prelaunch ? `In stock at launch, ${launch}` : "In stock"}
      </span>
    );

  const notifyRow = sheet?.kind === "notify" ? (sizes.find((r) => r.sku === sheet.sku) ?? null) : null;

  return (
    <div className="mx-auto max-w-[480px] bg-white">
      {/* 0. Header — 44px, scrolls away */}
      <header className="flex h-11 items-center justify-between px-1">
        <button type="button" className={iconBtn} aria-label="Menu">
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
            <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <span className="text-[15px] font-bold tracking-[0.02em]">RUN</span>
        <button type="button" className={iconBtn} aria-label="Bag">
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
            <path d="M5 8h12l-1 11H6L5 8z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M8 8V6a3 3 0 016 0v2" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
      </header>

      <main>
        {/* 1. Photos — 260px */}
        <section className="relative h-[260px] bg-photo" aria-label="Photos">
          <div
            className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
            onScroll={(e) => {
              const el = e.currentTarget;
              setPhoto(Math.round(el.scrollLeft / el.clientWidth));
            }}
          >
            {photoViews.map((p, i) => (
              <button
                key={p.view}
                type="button"
                className="grid h-full shrink-0 basis-full cursor-zoom-in snap-center place-items-center border-0 bg-transparent p-0 [&_svg]:h-auto [&_svg]:w-[78%]"
                onClick={() => setGallery(i)}
                data-testid={i === 0 ? "main-photo" : undefined}
                aria-label={`${p.label}, photo ${i + 1} of ${photoViews.length}. Open full screen`}
              >
                <ShoeArt view={p.view} />
              </button>
            ))}
          </div>
          <span
            className="absolute top-3 right-3 rounded-full bg-white/85 px-2 py-0.5 text-xs tabular-nums"
            aria-hidden="true"
          >
            {photo + 1}/{photoViews.length}
          </span>
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-1.5" aria-hidden="true">
            {photoViews.map((p, i) => (
              <span key={p.view} className={`size-1.5 rounded-full ${i === photo ? "bg-ink" : "bg-ink/25"}`} />
            ))}
          </div>
        </section>

        {/* 2. Name, colour, price, rating — 88px (12 + 24 + 20 + 24 + 8) */}
        <section className="h-[88px] overflow-hidden px-4 pt-3 pb-2">
          <h1 className="m-0 h-6 truncate text-xl leading-6 font-semibold">{product.name}</h1>
          <p className="m-0 h-5 truncate text-sm leading-5 text-ink-2">
            {product.colorway}
            {prelaunch ? ` · Launches ${launch}` : ""}
          </p>
          <div className="flex h-6 items-center justify-between">
            <span className="text-lg font-semibold tabular-nums" data-testid="price">${product.price.toFixed(0)}</span>
            <a
              className="-my-2.5 -mr-2 inline-flex h-11 items-center gap-1 px-2 text-sm tabular-nums text-ink no-underline"
              href="#reviews"
              aria-label={`Rated ${ratingSummary.average} out of 5 from ${ratingSummary.count} reviews. Go to reviews`}
            >
              <Stars value={ratingSummary.average} />
              <span>{ratingSummary.average.toFixed(1)}</span>
              <span className="text-ink-2 underline underline-offset-2">({ratingSummary.count})</span>
            </a>
          </div>
        </section>

        {/* 3. Sizes — 488px (48 + 328 + 12 + 32 + 44 + 24) */}
        <section className="h-[488px] scroll-mt-4 px-4 pb-6" ref={sizesRef} aria-labelledby="size-label">
          <div className="flex h-12 items-center justify-between">
            <h2 id="size-label" className="m-0 text-base font-semibold">
              Select size
            </h2>
            {/* Switch fills the 48px row; each segment is a 44px-tall tap target. */}
            <div className="inline-flex h-12 rounded-xl bg-soft p-0.5" role="group" aria-label="Size system">
              {(["W", "M", "EU"] as SizeMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  disabled={!ready}
                  className={`h-11 min-w-11 cursor-pointer rounded-[10px] border-0 px-3 text-sm font-medium disabled:cursor-default ${
                    mode === m ? "bg-white text-ink shadow-[0_1px_2px_rgba(0,0,0,0.12)]" : "bg-transparent text-ink-2"
                  }`}
                  aria-pressed={mode === m}
                  aria-label={m === "W" ? "US Women's" : m === "M" ? "US Men's" : "EU"}
                  onClick={() => changeMode(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {ready ? (
            <div
              className="grid h-[328px] auto-rows-[48px] grid-cols-5 content-start gap-2"
              role="group"
              aria-labelledby="size-label"
              data-testid="size-grid"
            >
              {sizes.map((row) => {
                const out = row.stock_status === "sold_out";
                const low = row.stock_status === "low_stock";
                const on = row.sku === selectedSku;
                const look = on
                  ? "border-ink bg-ink text-white"
                  : out
                    ? "strike-diagonal border-soft bg-soft text-ink/40"
                    : "border-line bg-white text-ink";
                return (
                  <button
                    key={row.sku}
                    type="button"
                    className={`relative h-12 min-w-0 cursor-pointer touch-manipulation rounded-lg border text-base font-medium tabular-nums transition-[background-color,border-color,transform] duration-100 active:scale-[0.97] motion-reduce:transition-none ${look}`}
                    data-testid={out ? "size-button-sold-out" : "size-button"}
                    aria-pressed={on}
                    aria-disabled={out || undefined}
                    aria-label={spokenSize(row, mode)}
                    onClick={() => tapSize(row)}
                  >
                    {sizeNumber(row, mode)}
                    {low && (
                      <span
                        className={`absolute top-1.5 right-1.5 size-1.5 rounded-full ${on ? "bg-volt" : "bg-low"}`}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            // Same 26 boxes, same place, no numbers: nothing she can read changes later.
            <div className="grid h-[328px] auto-rows-[48px] grid-cols-5 content-start gap-2" data-testid="size-grid" aria-hidden="true" inert>
              {sizes.map((row) => (
                <span key={row.sku} className="h-12 rounded-lg border border-line bg-soft" />
              ))}
            </div>
          )}

          <div
            className="mt-3 flex h-8 items-center gap-2 overflow-hidden text-sm whitespace-nowrap text-ink-2"
            role="status"
            aria-live="polite"
          >
            {status}
          </div>
          <button
            type="button"
            className="inline-flex h-11 min-w-[88px] cursor-pointer items-center border-0 bg-transparent p-0 text-sm underline underline-offset-[3px]"
            onClick={() => setSheet({ kind: "guide" })}
          >
            Size guide
          </button>
        </section>

        {/* 4. Tech details — 352px (8 + 48 + 4×56 + 48 + 24) */}
        <section className={`${sectionBox} h-[352px]`} aria-labelledby="tech-title">
          <div className="flex h-12 items-center">
            <h2 id="tech-title" className="m-0 text-lg font-semibold">
              Built for
            </h2>
          </div>
          <dl className="m-0 h-[224px] p-0">
            {specs.map((sp) => (
              <div key={sp.label} className="flex h-14 items-center justify-between border-b border-line text-[15px]">
                <dt className="text-ink-2">{sp.label}</dt>
                <dd className="m-0 max-w-[60%] truncate font-medium">{sp.value}</dd>
              </div>
            ))}
          </dl>
          <button type="button" className={outlineBtn} onClick={() => setSheet({ kind: "tech" })}>
            All details
          </button>
        </section>

        {/* 5. Reviews — 548px (8 + 48 + 72 + 16 + 152 + 12 + 152 + 16 + 48 + 24) */}
        <section id="reviews" className={`${sectionBox} h-[548px]`} aria-labelledby="reviews-title">
          <div className="flex h-12 items-center justify-between">
            <h2 id="reviews-title" className="m-0 text-lg font-semibold">
              Reviews
            </h2>
            <span className="text-sm tabular-nums text-ink-2">{ratingSummary.count} reviews</span>
          </div>

          <div className="flex h-[72px] items-center gap-4">
            <span className="text-4xl leading-none font-bold tabular-nums">{ratingSummary.average.toFixed(1)}</span>
            <div className="flex flex-col gap-1 text-[13px] text-ink-2">
              <Stars value={ratingSummary.average} />
              <span>out of 5</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 text-[13px] font-semibold">Fit: true to size</div>
              <div className="relative h-1 rounded-sm bg-line" aria-hidden="true">
                <span
                  className="absolute -top-1 -ml-1.5 size-3 rounded-full bg-ink"
                  style={{ left: `${ratingSummary.fit * 100}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-[11px] text-ink-3" aria-hidden="true">
                <span>Small</span>
                <span>Large</span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            {reviews.slice(0, 2).map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>

          <button type="button" className={`${outlineBtn} mt-4`} onClick={() => setSheet({ kind: "reviews" })}>
            See all {ratingSummary.count} reviews
          </button>
        </section>

        {/* Spacer so the sticky bar never covers the last button */}
        <div className="h-[calc(64px+env(safe-area-inset-bottom))]" aria-hidden="true" />
      </main>

      {/* Sticky button — 64px + safe area, sits on top of the page */}
      <div className="fixed inset-x-0 bottom-0 z-20 bg-white/95 px-4 pt-2 pb-[calc(8px+env(safe-area-inset-bottom))] shadow-[0_-1px_0_var(--color-line)]">
        <div className="mx-auto max-w-[448px]">
          <button type="button" className={primaryBtn} onClick={tapPrimary}>
            {primaryLabel}
          </button>
        </div>
      </div>

      {/* Sheets open on top of the page, so no section height ever changes */}
      {sheet?.kind === "tech" && (
        <Sheet title="All details" onClose={closeSheet} full>
          {techCopy.map((t) => (
            <div key={t.heading}>
              <h3 className="mt-4 mb-1 text-[15px] font-semibold first:mt-0">{t.heading}</h3>
              <p className="m-0 text-ink-2">{t.body}</p>
            </div>
          ))}
        </Sheet>
      )}

      {sheet?.kind === "reviews" && (
        <Sheet title={`Reviews (${ratingSummary.count})`} onClose={closeSheet} full>
          {reviews.map((r) => (
            <article key={r.id} className="border-b border-line py-4 first:pt-0">
              <div className="flex h-5 items-center justify-between text-xs text-ink-2">
                <Stars value={r.stars} />
                <span>{r.date}</span>
              </div>
              <h3 className="mt-2 mb-1 text-[15px] font-semibold">{r.title}</h3>
              <p className="m-0 text-ink-2">{r.body}</p>
              <div className="mt-1 text-xs text-ink-3">
                {r.name} · Bought {r.size}
              </div>
            </article>
          ))}
        </Sheet>
      )}

      {sheet?.kind === "guide" && (
        <Sheet title="Size guide" onClose={closeSheet} full>
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead>
              <tr>
                {["US Women", "US Men", "EU"].map((h) => (
                  <th key={h} scope="col" className="h-10 border-b border-line text-left font-medium text-ink-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sizes.map((r) => (
                <tr key={r.sku}>
                  <td className="h-10 border-b border-line">{num(r.size_us_women)}</td>
                  <td className="h-10 border-b border-line">{num(r.size_us_men)}</td>
                  <td className="h-10 border-b border-line">{r.size_eu}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Sheet>
      )}

      {sheet?.kind === "notify" && notifyRow && (
        <NotifySheet
          title={
            sheet.reason === "restock"
              ? `${sizeName(notifyRow, mode)} is sold out`
              : `${sizeName(notifyRow, mode)} launches ${launch}`
          }
          message={
            sheet.reason === "restock"
              ? `We'll email you if ${sizeName(notifyRow, mode)} comes back in stock.`
              : `We'll email you on ${launch} when ${sizeName(notifyRow, mode)} goes on sale.`
          }
          onClose={closeSheet}
        />
      )}

      {gallery !== null && <Gallery start={gallery} onClose={() => setGallery(null)} />}
    </div>
  );
}

/** One review card: 152px (12 + 20 + 8 + 20 + 4 + 60 + 4 + 16 + 12, minus borders). */
function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="h-[152px] overflow-hidden rounded-xl border border-line p-3">
      <div className="flex h-5 items-center justify-between text-xs text-ink-2">
        <Stars value={review.stars} />
        <span>{review.date}</span>
      </div>
      <h3 className="mt-2 mb-1 h-5 truncate text-[15px] font-semibold">{review.title}</h3>
      <p className="m-0 line-clamp-3 h-[60px] text-sm leading-5 text-ink">{review.body}</p>
      <div className="mt-1 h-4 text-xs text-ink-3">
        {review.name} · Bought {review.size}
      </div>
    </article>
  );
}

function NotifySheet({ title, message, onClose }: { title: string; message: string; onClose: () => void }) {
  const [done, setDone] = useState(false);
  return (
    <Sheet title={title} onClose={onClose}>
      {done ? (
        <p className="m-0 font-semibold text-ink">You&apos;re on the list.</p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setDone(true);
          }}
        >
          <p className="m-0 text-ink-2">{message}</p>
          <label className="mt-4 mb-2 block text-sm font-medium" htmlFor="notify-email">
            Email
          </label>
          {/* 16px text stops iOS from zooming in on focus */}
          <input
            id="notify-email"
            className="mb-4 h-12 w-full rounded-lg border border-line px-3 text-base"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
          />
          <button type="submit" className={primaryBtn}>
            Notify me
          </button>
        </form>
      )}
    </Sheet>
  );
}

function Gallery({ start, onClose }: { start: number; onClose: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(start);

  useEffect(() => {
    const el = trackRef.current;
    if (el) el.scrollLeft = start * el.clientWidth;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [start, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-photo" role="dialog" aria-modal="true" aria-label="Photos">
      <div className="flex h-14 shrink-0 items-center justify-between pl-4 pr-1 text-sm tabular-nums">
        <span>
          {index + 1} / {photoViews.length}
        </span>
        <button type="button" className={iconBtn} onClick={onClose} aria-label="Close photos" autoFocus>
          <CloseIcon />
        </button>
      </div>
      <div
        ref={trackRef}
        className="no-scrollbar flex flex-1 snap-x snap-mandatory overflow-x-auto"
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        {photoViews.map((p) => (
          <div
            key={p.view}
            className="grid shrink-0 basis-full snap-center place-items-center touch-pinch-zoom [&_svg]:h-auto [&_svg]:w-[92%]"
          >
            <ShoeArt view={p.view} />
          </div>
        ))}
      </div>
    </div>
  );
}
