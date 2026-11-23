"use client";

import { useEffect, useRef, type ReactNode } from "react";
import s from "./pdp.module.css";

export function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Bottom sheet. Opens over the page so the page height never changes. */
export function Sheet({
  title,
  onClose,
  full = false,
  children,
}: {
  title: string;
  onClose: () => void;
  full?: boolean;
  children: ReactNode;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className={s.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`${s.sheet} ${full ? s.sheetFull : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className={s.sheetHead}>
          <h2 className={s.sheetTitle}>{title}</h2>
          <button ref={closeRef} type="button" className={s.iconBtn} onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <div className={s.sheetBody}>{children}</div>
      </div>
    </div>
  );
}
