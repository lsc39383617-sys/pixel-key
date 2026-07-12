"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { MemoryData } from "./flowerData";

type MemoryModalProps = {
  memory: MemoryData;
  color: string;
  onClose: () => void;
};

const categoryStyles: Record<
  MemoryData["category"],
  { bg: string; text: string; dot: string }
> = {
  Food: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-400" },
  Place: { bg: "bg-sky-100", text: "text-sky-700", dot: "bg-sky-400" },
  Memory: { bg: "bg-violet-100", text: "text-violet-700", dot: "bg-violet-400" },
};

export function MemoryModal({ memory, color, onClose }: MemoryModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [closing, setClosing] = useState(false);

  const handleClose = useCallback(() => {
    setClosing(true);
  }, []);


  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(onClose, 260);
    return () => window.clearTimeout(timer);
  }, [closing, onClose]);

  useEffect(() => {
    closeRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleClose]);

  if (typeof document === "undefined") return null;

  const cat = categoryStyles[memory.category];

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="memory-modal-title"
    >
      <button
        type="button"
        className={`absolute inset-0 bg-stone-900/30 backdrop-blur-sm ${
          closing ? "animate-modal-backdrop-out" : "animate-modal-backdrop"
        }`}
        aria-label="Close modal"
        onClick={handleClose}
      />

      <div
        className={`relative mx-4 w-full max-w-sm overflow-hidden rounded-[1.75rem] bg-white shadow-[0_24px_80px_-12px_rgba(0,0,0,0.25)] ring-1 ring-stone-200/60 safe-modal-bottom sm:mb-0 ${
          closing ? "animate-modal-slide-out" : "animate-modal-slide"
        }`}
      >
        <div
          className="relative flex h-44 items-center justify-center overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${color}55 0%, ${color}22 50%, #fafaf9 100%)`,
          }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 30% 40%, ${color} 0%, transparent 50%)`,
            }}
          />

          <div className="animate-modal-content relative flex h-20 w-20 flex-col items-center justify-center rounded-2xl bg-white/70 shadow-sm ring-1 ring-white/90 backdrop-blur-sm animation-delay-100">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-8 w-8 text-stone-400"
              aria-hidden
            >
              <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor" />
              <path
                d="M3 16l4.5-4.5 3 3L14 11l7 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <span className="mt-1 text-[10px] font-medium text-stone-400">
              Photo
            </span>
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-stone-500 shadow-sm ring-1 ring-stone-200/60 backdrop-blur-sm transition-all hover:scale-105 hover:bg-white hover:text-stone-800 active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="px-5 pb-5 pt-4">
          <span
            className={`animate-modal-content inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider animation-delay-150 ${cat.bg} ${cat.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${cat.dot}`} aria-hidden />
            {memory.category}
          </span>

          <h2
            id="memory-modal-title"
            className="animate-modal-content mt-2.5 text-xl font-semibold tracking-tight text-stone-900 animation-delay-200"
          >
            {memory.title}
          </h2>

          <p className="animate-modal-content mt-2 text-[15px] leading-relaxed text-stone-500 animation-delay-300">
            {memory.description}
          </p>

          <button
            type="button"
            className="animate-modal-content mt-5 flex w-full flex-col items-center gap-0.5 rounded-[1rem] bg-stone-900 px-4 py-3.5 text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)] transition-all hover:bg-stone-800 active:scale-[0.98] animation-delay-400"
          >
            <span className="flex items-center gap-2 text-[15px] font-semibold">
              <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden>
                <path
                  d="M12 21s-6-5.33-6-10a6 6 0 1112 0c0 4.67-6 10-6 10z"
                  stroke="currentColor"
                  strokeWidth="1.75"
                />
                <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.75" />
              </svg>
              Open Map
            </span>
            <span className="text-[12px] font-medium text-white/55">
              {memory.location}
            </span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
