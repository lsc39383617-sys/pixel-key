"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getCategoryMeta } from "@/lib/pixel-category";
import type { Pixel } from "@/types/pixel";

type MemoryFeedCardProps = {
  pixel: Pixel;
  index: number;
};

const FALLBACK_BACKGROUNDS = [
  "linear-gradient(145deg,#ffc9ca,#f2a3bf 48%,#cda9ef)",
  "linear-gradient(145deg,#b9e8e1,#86c8c5 48%,#86a6e6)",
  "linear-gradient(145deg,#ffe4ad,#f7ba73 48%,#e78f9b)",
  "linear-gradient(145deg,#d7e9b6,#91c99b 48%,#70a5c7)",
];

function formatDate(value: string | null) {
  if (!value) return "오늘의 기록";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function IconButton({
  label,
  active = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-full transition active:scale-90 ${
        active
          ? "bg-rose-50 text-rose-500"
          : "text-stone-700 hover:bg-stone-100"
      }`}
    >
      {children}
    </button>
  );
}

export function MemoryFeedCard({ pixel, index }: MemoryFeedCardProps) {
  const router = useRouter();
  const meta = getCategoryMeta(pixel.category);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareLabel, setShareLabel] = useState("공유");

  const detailUrl = useMemo(() => {
    if (typeof window === "undefined") return `/pixel/${pixel.uid}`;
    return `${window.location.origin}/pixel/${pixel.uid}`;
  }, [pixel.uid]);


  function toggleLike() {
    setLiked((current) => {
      const next = !current;
      localStorage.setItem(`pixel-like:${pixel.uid}`, next ? "1" : "0");
      return next;
    });
  }

  function toggleSave() {
    setSaved((current) => {
      const next = !current;
      localStorage.setItem(`pixel-save:${pixel.uid}`, next ? "1" : "0");
      return next;
    });
  }

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: pixel.name,
          text: pixel.description || pixel.place_name || "Pixel Key의 추억",
          url: detailUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(detailUrl);
      setShareLabel("복사됨");
      window.setTimeout(() => setShareLabel("공유"), 1500);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareLabel("다시 시도");
    }
  }

  const location = pixel.place_name || pixel.road_address_name || pixel.address_name;
  const fallback = FALLBACK_BACKGROUNDS[index % FALLBACK_BACKGROUNDS.length];

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-white/75 bg-white/90 shadow-[0_18px_50px_rgba(77,55,51,0.12)] backdrop-blur-xl">
      <header className="flex items-center justify-between px-4 py-3.5">
        <button
          type="button"
          onClick={() => router.push(`/pixel/${pixel.uid}`)}
          className="flex min-w-0 items-center gap-3 text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(145deg,#f9a9b9,#f6ca8d)] p-[2px]">
            <span className="flex h-full w-full items-center justify-center rounded-full border-2 border-white bg-stone-900 text-sm font-black text-white">
              P
            </span>
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-black tracking-tight text-stone-900">
              나의 기억 정원
            </span>
            <span className="mt-0.5 block truncate text-[11px] font-medium text-stone-400">
              {location || formatDate(pixel.visited_at)}
            </span>
          </span>
        </button>

        <span className="rounded-full bg-stone-100 px-3 py-1.5 text-[10px] font-black text-stone-500">
          {meta.emoji} {meta.label}
        </span>
      </header>

      <button
        type="button"
        onClick={() => router.push(`/pixel/${pixel.uid}`)}
        className="relative block aspect-[4/5] w-full overflow-hidden bg-stone-100 text-left sm:aspect-[5/4]"
      >
        {pixel.image ? (
          <img
            src={pixel.image}
            alt={pixel.name}
            className="h-full w-full object-cover transition duration-500 hover:scale-[1.025]"
          />
        ) : (
          <span
            className="flex h-full w-full flex-col items-center justify-center text-white"
            style={{ background: fallback }}
          >
            <span className="text-7xl drop-shadow-sm">{meta.emoji}</span>
            <span className="mt-5 max-w-[75%] text-center text-2xl font-black tracking-[-0.04em] drop-shadow-sm">
              {pixel.name}
            </span>
          </span>
        )}

        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/50 to-transparent" />
        <span className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
          <span className="min-w-0">
            <span className="block truncate text-xl font-black tracking-[-0.04em] drop-shadow-sm">
              {pixel.name}
            </span>
            {location ? (
              <span className="mt-1 block truncate text-xs font-semibold text-white/80 drop-shadow-sm">
                ⌖ {location}
              </span>
            ) : null}
          </span>
          <span className="shrink-0 rounded-full border border-white/30 bg-black/25 px-3 py-1.5 text-[10px] font-bold backdrop-blur-lg">
            {formatDate(pixel.visited_at)}
          </span>
        </span>
      </button>

      <div className="px-4 pb-4 pt-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <IconButton label={liked ? "좋아요 취소" : "좋아요"} active={liked} onClick={toggleLike}>
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill={liked ? "currentColor" : "none"}>
                <path
                  d="M20.8 4.9c-2-2-5.2-2-7.2 0L12 6.5l-1.6-1.6c-2-2-5.2-2-7.2 0s-2 5.2 0 7.2L12 20.9l8.8-8.8c2-2 2-5.2 0-7.2z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </IconButton>
            <IconButton label="추억 열기" onClick={() => router.push(`/pixel/${pixel.uid}`)}>
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                <path d="M5 5h14v11H9l-4 3V5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
            </IconButton>
            <IconButton label={shareLabel} onClick={share}>
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                <path d="M21 3L10 14M21 3l-7 18-4-7-7-4 18-7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
            </IconButton>
          </div>

          <IconButton label={saved ? "저장 취소" : "저장"} active={saved} onClick={toggleSave}>
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill={saved ? "currentColor" : "none"}>
              <path d="M6 3h12v18l-6-4-6 4V3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </IconButton>
        </div>

        <div className="mt-1 px-1">
          <p className="text-sm leading-6 text-stone-700">
            <span className="mr-2 font-black text-stone-900">pixel.key</span>
            {pixel.description || "이 순간을 나의 기억 정원에 저장했어요."}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold text-stone-400">
            <span>#{meta.label}</span>
            {pixel.place_name ? <span>#{pixel.place_name.replaceAll(" ", "")}</span> : null}
            <span className="ml-auto">{shareLabel}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
