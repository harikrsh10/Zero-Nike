"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import s from "./pdp.module.css";
import { Sheet, CloseIcon } from "./Sheet";
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
  type SizeRow,
} from "@/data/product";

import type { SizeMode } from "@/data/product";
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

function num(n: number) {
  return String(n); // 5.0 -> "5", 5.5 -> "5.5"
}

function sizeNumber(row: SizeRow, mode: SizeMode) {
  if (mode === "W") return num(row.size_us_women);
  if (mode === "M") return num(row.size_us_men);
  return row.size_eu;
}

function sizeName(row: SizeRow, mode: SizeMode) {
  return `${mode} ${sizeNumber(row, mode)}`;
}

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
    <span className={s.stars} aria-hidden="true">
      {"★".repeat(full)}
      <span style={{ color: "#cfcfcf" }}>{"★".repeat(5 - full)}</span>
    </span>
  );
}

export function ProductPage({
  prelaunch,
  initialMode,
}: {
  prelaunch: boolean;
  initialMode: SizeMode;
}) {
  const [mode, setMode] = useState<SizeMode>(initialMode);
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [nudge, setNudge] = useState(false);
  const [added, setAdded] = useState(false);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [photo, setPhoto] = useState(0);
  const [gallery, setGallery] = useState<number | null>(null);
  const sizesRef = useRef<HTMLElement>(null);

  // Remember her size system in a cookie so the server renders it next time (no flash).
  const changeMode = (m: SizeMode) => {
    setMode(m);
    saveMode(m);
  };

  const selected = sizes.find((r) => r.sku === selectedSku) ?? null;
  const launch = formatLaunch(product.launchDate);
  const closeSheet = useCallback(() => setSheet(null), []);

  const tapSize = (row: SizeRow) => {
    if (row.stock_status === "sold_out") {
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
  else primaryLabel = added ? `Added to cart · ${sizeName(selected, mode)}` : `Add to cart · ${sizeName(selected, mode)}`;

  let status: React.ReactNode = null;
  if (nudge) status = <span className={s.statusNudge}>Pick a size first</span>;
  else if (selected?.stock_status === "low_stock")
    status = (
      <span className={s.statusWarn}>
        {sizeName(selected, mode)} · Only {selected.stock_quantity} left
      </span>
    );
  else if (selected)
    status = (
      <span>
        {sizeName(selected, mode)} · {prelaunch ? `In stock at launch, ${launch}` : "In stock"}
      </span>
    );

  const notifyRow = sheet?.kind === "notify" ? sizes.find((r) => r.sku === sheet.sku) ?? null : null;

  return (
    <div className={s.page}>
      {/* 0. Header — 44px, scrolls away */}
      <header className={s.header}>
        <button type="button" className={s.iconBtn} aria-label="Menu">
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
            <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <span className={s.headerTitle}>RUN</span>
        <button type="button" className={s.iconBtn} aria-label="Bag">
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
            <path d="M5 8h12l-1 11H6L5 8z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M8 8V6a3 3 0 016 0v2" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
      </header>

      <main>
        {/* 1. Photos — 260px */}
        <section className={s.photos} aria-label="Photos">
          <div
            className={s.track}
            onScroll={(e) => {
              const el = e.currentTarget;
              setPhoto(Math.round(el.scrollLeft / el.clientWidth));
            }}
          >
            {photoViews.map((p, i) => (
              <button
                key={p.view}
                type="button"
                className={s.slide}
                onClick={() => setGallery(i)}
                aria-label={`${p.label}, photo ${i + 1} of ${photoViews.length}. Open full screen`}
              >
                <ShoeArt view={p.view} />
              </button>
            ))}
          </div>
          <span className={s.photoCount} aria-hidden="true">
            {photo + 1}/{photoViews.length}
          </span>
          <div className={s.dots} aria-hidden="true">
            {photoViews.map((p, i) => (
              <span key={p.view} className={`${s.dot} ${i === photo ? s.dotOn : ""}`} />
            ))}
          </div>
        </section>

        {/* 2. Name, colour, price, rating — 88px */}
        <section className={s.title}>
          <h1 className={s.name}>{product.name}</h1>
          <p className={s.colorway}>
            {product.colorway}
            {prelaunch ? ` · Launches ${launch}` : ""}
          </p>
          <div className={s.priceRow}>
            <span className={s.price}>${product.price.toFixed(0)}</span>
            <a
              className={s.ratingLink}
              href="#reviews"
              aria-label={`Rated ${ratingSummary.average} out of 5 from ${ratingSummary.count} reviews. Go to reviews`}
            >
              <Stars value={ratingSummary.average} />
              <span>{ratingSummary.average.toFixed(1)}</span>
              <span className={s.ratingCount}>({ratingSummary.count})</span>
            </a>
          </div>
        </section>

        {/* 3. Sizes — 488px */}
        <section className={s.sizes} ref={sizesRef} aria-labelledby="size-label">
          <div className={s.sizesHeader}>
            <h2 id="size-label" className={s.sectionLabel}>
              Select size
            </h2>
            <div className={s.segmented} role="group" aria-label="Size system">
              {(["W", "M", "EU"] as SizeMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`${s.segment} ${mode === m ? s.segmentOn : ""}`}
                  aria-pressed={mode === m}
                  aria-label={m === "W" ? "US Women's" : m === "M" ? "US Men's" : "EU"}
                  onClick={() => changeMode(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className={s.grid} role="group" aria-labelledby="size-label">
            {sizes.map((row) => {
              const out = row.stock_status === "sold_out";
              const low = row.stock_status === "low_stock";
              const on = row.sku === selectedSku;
              return (
                <button
                  key={row.sku}
                  type="button"
                  className={[s.size, out && s.sizeOut, low && s.sizeLow, on && s.sizeOn].filter(Boolean).join(" ")}
                  aria-pressed={on}
                  aria-disabled={out || undefined}
                  aria-label={spokenSize(row, mode)}
                  onClick={() => tapSize(row)}
                >
                  {sizeNumber(row, mode)}
                </button>
              );
            })}
          </div>

          <div className={s.status} role="status" aria-live="polite">
            {status}
          </div>
          <button type="button" className={s.linkBtn} onClick={() => setSheet({ kind: "guide" })}>
            Size guide
          </button>
        </section>

        {/* 4. Tech details — 352px */}
        <section className={`${s.section} ${s.tech}`} aria-labelledby="tech-title">
          <div className={s.sectionHead}>
            <h2 id="tech-title" className={s.sectionTitle}>
              Built for
            </h2>
          </div>
          <dl className={s.specList}>
            {specs.map((sp) => (
              <div key={sp.label} className={s.specRow}>
                <dt>{sp.label}</dt>
                <dd>{sp.value}</dd>
              </div>
            ))}
          </dl>
          <button type="button" className={s.outlineBtn} onClick={() => setSheet({ kind: "tech" })}>
            All details
          </button>
        </section>

        {/* 5. Reviews — 548px */}
        <section id="reviews" className={`${s.section} ${s.reviews}`} aria-labelledby="reviews-title">
          <div className={s.sectionHead}>
            <h2 id="reviews-title" className={s.sectionTitle}>
              Reviews
            </h2>
            <span className={s.reviewsCount}>{ratingSummary.count} reviews</span>
          </div>

          <div className={s.summary}>
            <span className={s.bigAvg}>{ratingSummary.average.toFixed(1)}</span>
            <div className={s.summaryStars}>
              <Stars value={ratingSummary.average} />
              <span>out of 5</span>
            </div>
            <div className={s.fit}>
              <div className={s.fitLabel}>Fit: true to size</div>
              <div className={s.fitBar} aria-hidden="true">
                <span className={s.fitMark} style={{ left: `${ratingSummary.fit * 100}%` }} />
              </div>
              <div className={s.fitEnds} aria-hidden="true">
                <span>Small</span>
                <span>Large</span>
              </div>
            </div>
          </div>

          <div className={s.cards}>
            {reviews.slice(0, 2).map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>

          <button type="button" className={s.outlineBtn} onClick={() => setSheet({ kind: "reviews" })}>
            See all {ratingSummary.count} reviews
          </button>
        </section>

        <div className={s.spacer} aria-hidden="true" />
      </main>

      {/* Sticky button — 64px + safe area */}
      <div className={s.sticky}>
        <div className={s.stickyInner}>
          <button type="button" className={s.primaryBtn} onClick={tapPrimary}>
            {primaryLabel}
          </button>
        </div>
      </div>

      {/* Sheets */}
      {sheet?.kind === "tech" && (
        <Sheet title="All details" onClose={closeSheet} full>
          {techCopy.map((t) => (
            <div key={t.heading}>
              <h3>{t.heading}</h3>
              <p>{t.body}</p>
            </div>
          ))}
        </Sheet>
      )}

      {sheet?.kind === "reviews" && (
        <Sheet title={`Reviews (${ratingSummary.count})`} onClose={closeSheet} full>
          {reviews.map((r) => (
            <article key={r.id} className={s.fullReview}>
              <div className={s.cardTop}>
                <Stars value={r.stars} />
                <span>{r.date}</span>
              </div>
              <h3>{r.title}</h3>
              <p>{r.body}</p>
              <div className={s.cardMeta}>
                {r.name} · Bought {r.size}
              </div>
            </article>
          ))}
        </Sheet>
      )}

      {sheet?.kind === "guide" && (
        <Sheet title="Size guide" onClose={closeSheet} full>
          <table className={s.guide}>
            <thead>
              <tr>
                <th scope="col">US Women</th>
                <th scope="col">US Men</th>
                <th scope="col">EU</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((r) => (
                <tr key={r.sku}>
                  <td>{num(r.size_us_women)}</td>
                  <td>{num(r.size_us_men)}</td>
                  <td>{r.size_eu}</td>
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

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className={s.card}>
      <div className={s.cardTop}>
        <Stars value={review.stars} />
        <span>{review.date}</span>
      </div>
      <h3 className={s.cardTitle}>{review.title}</h3>
      <p className={s.cardBody}>{review.body}</p>
      <div className={s.cardMeta}>
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
        <p className={s.done}>You&apos;re on the list.</p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setDone(true);
          }}
        >
          <p>{message}</p>
          <label className={s.field} htmlFor="notify-email">
            Email
          </label>
          <input
            id="notify-email"
            className={s.input}
            type="email"
            autoComplete="email"
            inputMode="email"
            required
          />
          <button type="submit" className={s.primaryBtn}>
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
    <div className={s.gallery} role="dialog" aria-modal="true" aria-label="Photos">
      <div className={s.galleryHead}>
        <span>
          {index + 1} / {photoViews.length}
        </span>
        <button type="button" className={s.iconBtn} onClick={onClose} aria-label="Close photos" autoFocus>
          <CloseIcon />
        </button>
      </div>
      <div
        ref={trackRef}
        className={s.galleryTrack}
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        {photoViews.map((p) => (
          <div key={p.view} className={s.gallerySlide}>
            <ShoeArt view={p.view} />
          </div>
        ))}
      </div>
    </div>
  );
}
