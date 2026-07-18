"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { PixelFlower } from "@/components/flower/PixelFlower";
import { FLOWER_TOTAL_COUNT } from "@/components/flower/flowerData";
import { MemoryFeedCard } from "@/components/social/MemoryFeedCard";
import { MemoryStories } from "@/components/social/MemoryStories";
import { BottomNav } from "@/components/ui/BottomNav";
import { getPixels } from "@/lib/pixel";
import { CATEGORY_OPTIONS } from "@/lib/pixel-category";
import type { Pixel, PixelCategory } from "@/types/pixel";

type CategoryFilter = "all" | PixelCategory;

export default function HomePage() {
  const router = useRouter();
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getPixels();
        if (!cancelled) setPixels(data);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Pixel 목록을 불러오지 못했습니다.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPixels = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return pixels.filter((pixel) => {
      const categoryMatches = category === "all" || pixel.category === category;
      const searchable = [
        pixel.name,
        pixel.description,
        pixel.place_name,
        pixel.address_name,
        pixel.road_address_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return categoryMatches && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [category, pixels, query]);

  const filledCount = Math.min(pixels.length, FLOWER_TOTAL_COUNT);
  const percentage = Math.round((filledCount / FLOWER_TOTAL_COUNT) * 100);
  const placeCount = new Set(
    pixels.map((pixel) => pixel.place_name).filter((place): place is string => Boolean(place)),
  ).size;

  return (
    <div id="top" className="relative min-h-dvh overflow-x-hidden bg-social-gradient">
      <main className="safe-top mx-auto min-h-dvh max-w-md px-4 pb-32">
        <header id="profile" className="animate-fade-up flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex min-w-0 items-center gap-3 text-left"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(145deg,#ff7f9d,#ffb56c)] p-[2px] shadow-[0_8px_24px_rgba(224,96,124,0.24)]">
              <span className="flex h-full w-full items-center justify-center rounded-full border-2 border-[#fff8f2] bg-stone-900 text-sm font-black text-white">
                P
              </span>
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-black uppercase tracking-[0.28em] text-rose-500">
                Pixel Key
              </span>
              <span className="mt-0.5 block truncate text-base font-black tracking-[-0.03em] text-stone-900">
                나의 기억 정원
              </span>
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="알림"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/75 bg-white/70 text-stone-700 shadow-[0_8px_24px_rgba(75,54,48,0.08)] backdrop-blur-xl transition active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                <path d="M18 9a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7zM10 20h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => router.push("/add")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-2xl font-light text-white shadow-[0_10px_26px_rgba(31,25,23,0.22)] transition hover:-translate-y-0.5 active:scale-95"
              aria-label="새 Pixel 만들기"
            >
              +
            </button>
          </div>
        </header>

        <MemoryStories pixels={pixels} />

        <section id="garden" className="animate-fade-up animation-delay-100 mt-5 scroll-mt-6">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-[linear-gradient(145deg,rgba(38,24,35,0.98),rgba(60,35,55,0.95)_55%,rgba(30,51,46,0.96))] p-3 shadow-[0_28px_70px_-30px_rgba(48,28,42,0.62)]">
            <div className="pointer-events-none absolute -left-20 -top-16 h-56 w-56 rounded-full bg-rose-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-emerald-300/15 blur-3xl" />

            <div className="relative z-10 flex items-start justify-between px-3 pb-1 pt-3 text-white">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.26em] text-white/50">
                  My digital garden
                </p>
                <h1 className="mt-1.5 text-[1.7rem] font-black leading-tight tracking-[-0.055em]">
                  오늘도 기억이<br />한 잎 자랐어요
                </h1>
              </div>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-black text-white/90 backdrop-blur-lg">
                BLOOM {percentage}%
              </span>
            </div>

            <PixelFlower size="lg" dbPixels={pixels} className="relative z-10 -mt-2" />

            <div className="relative z-20 -mt-5 grid grid-cols-3 gap-2 px-1 pb-1">
              {[
                { label: "추억", value: pixels.length },
                { label: "장소", value: placeCount },
                { label: "개화", value: `${percentage}%` },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-center text-white backdrop-blur-xl">
                  <p className="text-lg font-black tracking-tight">{item.value}</p>
                  <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-white/45">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="animate-fade-up animation-delay-200 mt-5 grid grid-cols-[1fr_auto] gap-3">
          <button
            type="button"
            onClick={() => router.push("/add")}
            className="group flex items-center justify-between rounded-[1.35rem] bg-stone-900 px-5 py-4 text-left text-white shadow-[0_16px_34px_rgba(31,25,23,0.2)] transition hover:-translate-y-0.5 active:scale-[0.99]"
          >
            <span>
              <span className="block text-[10px] font-black uppercase tracking-[0.22em] text-white/40">Create</span>
              <span className="mt-1 block text-sm font-black">새 추억 피우기</span>
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-stone-900 transition group-hover:rotate-45">+</span>
          </button>
          <button
            type="button"
            onClick={() => document.getElementById("memories")?.scrollIntoView({ behavior: "smooth" })}
            className="flex w-[72px] items-center justify-center rounded-[1.35rem] border border-white/80 bg-white/68 text-stone-700 shadow-[0_12px_28px_rgba(80,58,52,0.08)] backdrop-blur-xl transition active:scale-95"
            aria-label="피드 보기"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none"><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </section>

        <section id="memories" className="animate-fade-up animation-delay-300 mt-10 scroll-mt-5">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-rose-500">Memory feed</p>
              <h2 className="mt-1 text-[1.65rem] font-black tracking-[-0.05em] text-stone-900">나의 피드</h2>
            </div>
            {!loading && !error ? (
              <span className="rounded-full border border-white/75 bg-white/60 px-3 py-1.5 text-xs font-black text-stone-500 backdrop-blur-xl">
                {filteredPixels.length} posts
              </span>
            ) : null}
          </div>

          <div className="sticky top-2 z-30 rounded-[1.45rem] border border-white/75 bg-white/72 p-2 shadow-[0_14px_36px_rgba(73,52,48,0.09)] backdrop-blur-2xl">
            <label htmlFor="pixel-search" className="sr-only">Pixel 검색</label>
            <div className="flex items-center gap-2 rounded-2xl bg-white/85 px-4 py-3">
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-stone-400" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" /><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              <input
                id="pixel-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="장소, 추억, 주소 검색"
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-stone-800 outline-none placeholder:text-stone-400"
              />
            </div>

            <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => setCategory("all")}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition ${category === "all" ? "bg-stone-900 text-white shadow-md" : "bg-white/75 text-stone-500"}`}
              >
                전체
              </button>
              {CATEGORY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCategory(option.value)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition ${category === option.value ? "bg-stone-900 text-white shadow-md" : "bg-white/75 text-stone-500"}`}
                >
                  {option.emoji} {option.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-4 space-y-5">
          {loading ? (
            <div className="space-y-4">
              {[0, 1].map((item) => (
                <div key={item} className="overflow-hidden rounded-[1.75rem] border border-white/75 bg-white/65 p-4 shadow-sm">
                  <div className="h-10 w-40 animate-pulse rounded-full bg-stone-200/70" />
                  <div className="mt-4 aspect-[4/5] animate-pulse rounded-2xl bg-stone-200/60" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50/85 p-5 text-sm leading-6 text-rose-700">{error}</div>
          ) : filteredPixels.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-stone-300/80 bg-white/45 p-10 text-center backdrop-blur-xl">
              <p className="text-4xl">🌱</p>
              <p className="mt-4 text-sm font-black text-stone-700">{pixels.length === 0 ? "첫 번째 추억을 피워보세요." : "검색 조건에 맞는 추억이 없어요."}</p>
              {pixels.length === 0 ? (
                <button type="button" onClick={() => router.push("/add")} className="mt-4 rounded-full bg-stone-900 px-5 py-2.5 text-xs font-black text-white">첫 기록 만들기</button>
              ) : null}
            </div>
          ) : (
            filteredPixels.map((pixel, index) => (
              <MemoryFeedCard key={pixel.uid} pixel={pixel} index={index} />
            ))
          )}
        </section>

        <footer className="mt-10 pb-4 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-stone-400">Grow memories, bloom together</p>
        </footer>
      </main>

      <BottomNav />
    </div>
  );
}
