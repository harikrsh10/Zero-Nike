"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export const iconBtn = "grid size-11 shrink-0 cursor-pointer place-items-center border-0 bg-transparent p-0";

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
      className="fixed inset-0 z-40 flex animate-fade items-end justify-center bg-black/40 motion-reduce:animate-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`flex max-h-[88dvh] w-full max-w-[480px] animate-rise flex-col rounded-t-2xl bg-white motion-reduce:animate-none ${full ? "h-[88dvh]" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-line pl-4 pr-1">
          <h2 className="m-0 text-[17px] font-semibold">{title}</h2>
          <button ref={closeRef} type="button" className={iconBtn} onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pt-4 pb-[calc(24px+env(safe-area-inset-bottom))] text-[15px] leading-[22px]">
          {children}
        </div>
      </div>
    </div>
  );
}
