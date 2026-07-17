"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PixelFlower } from "@/components/flower/PixelFlower";
import { FLOWER_TOTAL_COUNT } from "@/components/flower/flowerData";
import { BottomNav } from "@/components/ui/BottomNav";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { getPixels } from "@/lib/pixel";
import { CATEGORY_OPTIONS, getCategoryMeta } from "@/lib/pixel-category";
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
  const placeCount = pixels.filter((pixel) => pixel.place_name).length;

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-warm-gradient">
      <main className="safe-top mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-28">
        <header className="animate-fade-up mt-1 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.32em] text-rose-500">
              Pixel Key
            </p>
            <h1 className="mt-2 text-[2rem] font-black leading-none tracking-[-0.05em] text-stone-900">
              나의 기억 정원
            </h1>
            <p className="mt-3 max-w-[280px] text-sm leading-6 text-stone-500">
              좋아했던 장소와 순간을 모아, 세상에 하나뿐인 꽃을 피워보세요.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/add")}
            className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white/75 text-2xl font-light text-stone-800 shadow-[0_10px_25px_rgba(91,67,59,0.12)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white active:scale-95"
            aria-label="새 Pixel 만들기"
          >
            +
          </button>
        </header>

        <section className="animate-fade-up animation-delay-100 mt-6">
          <div className="relative rounded-[2.25rem] border border-white/85 bg-white/28 px-1 pb-5 pt-6 shadow-[0_24px_70px_-42px_rgba(90,55,50,0.55)] backdrop-blur-sm">
            <div className="absolute left-5 top-5 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-[10px] font-bold text-stone-500 shadow-sm backdrop-blur">
              BLOOM {percentage}%
            </div>
            <PixelFlower size="lg" dbPixels={pixels} />
          </div>
        </section>

        <section className="animate-fade-up animation-delay-200 mt-5 grid grid-cols-3 gap-2.5">
          {[
            { label: "추억", value: pixels.length, emoji: "✦" },
            { label: "장소", value: placeCount, emoji: "⌖" },
            { label: "개화", value: `${percentage}%`, emoji: "❀" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/80 bg-white/65 px-3 py-3.5 text-center shadow-[0_8px_25px_rgba(90,67,56,0.08)] backdrop-blur"
            >
              <p className="text-sm text-rose-400">{item.emoji}</p>
              <p className="mt-1 text-xl font-black tracking-tight text-stone-800">{item.value}</p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-stone-400">
                {item.label}
              </p>
            </div>
          ))}
        </section>

        <section className="animate-fade-up animation-delay-300 mt-5">
          <PrimaryButton onClick={() => router.push("/add")}>
            새 추억으로 꽃잎 피우기
          </PrimaryButton>
        </section>

        <section className="animate-fade-up animation-delay-300 mt-9">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-stone-400">
                Memory Archive
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-stone-900">내 Pixel</h2>
            </div>
            {!loading && !error ? (
              <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-bold text-stone-500">
                {filteredPixels.length}개
              </span>
            ) : null}
          </div>

          <div className="rounded-[1.5rem] border border-white/80 bg-white/55 p-2 shadow-[0_12px_35px_rgba(92,70,61,0.08)] backdrop-blur">
            <label htmlFor="pixel-search" className="sr-only">
              Pixel 검색
            </label>
            <div className="flex items-center gap-2 rounded-2xl bg-white/80 px-4 py-3">
              <span className="text-stone-400">⌕</span>
              <input
                id="pixel-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="장소나 추억을 검색하세요"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400"
              />
            </div>

            <div className="mt-2 flex gap-2 overflow-x-auto px-1 pb-1">
              <button
                type="button"
                onClick={() => setCategory("all")}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                  category === "all"
                    ? "bg-stone-900 text-white shadow-md"
                    : "bg-white/75 text-stone-500"
                }`}
              >
                전체
              </button>
              {CATEGORY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCategory(option.value)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                    category === option.value
                      ? "bg-stone-900 text-white shadow-md"
                      : "bg-white/75 text-stone-500"
                  }`}
                >
                  {option.emoji} {option.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-4">
          {loading ? (
            <p className="rounded-3xl bg-white/55 p-8 text-center text-sm text-stone-500">
              정원의 추억을 불러오는 중...
            </p>
          ) : error ? (
            <p className="rounded-3xl border border-rose-200 bg-rose-50/80 p-5 text-sm leading-6 text-rose-700">
              {error}
            </p>
          ) : filteredPixels.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-stone-300/80 bg-white/35 p-9 text-center">
              <p className="text-3xl">🌱</p>
              <p className="mt-3 text-sm font-semibold text-stone-600">
                {pixels.length === 0
                  ? "아직 피어난 추억이 없어요."
                  : "검색 조건에 맞는 Pixel이 없어요."}
              </p>
              {pixels.length === 0 ? (
                <button
                  type="button"
                  onClick={() => router.push("/add")}
                  className="mt-3 text-xs font-bold text-rose-500 underline underline-offset-4"
                >
                  첫 꽃잎 피우기
                </button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPixels.map((pixel, index) => {
                const meta = getCategoryMeta(pixel.category);
                return (
                  <button
                    key={pixel.uid}
                    type="button"
                    onClick={() => router.push(`/pixel/${pixel.uid}`)}
                    className="group w-full overflow-hidden rounded-[1.5rem] border border-white/85 bg-white/72 p-3 text-left shadow-[0_10px_30px_rgba(89,67,58,0.08)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_35px_rgba(89,67,58,0.13)] active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.1rem] text-2xl shadow-inner"
                        style={{
                          background:
                            index % 3 === 0
                              ? "linear-gradient(145deg,#FFE4DA,#F7C9D8)"
                              : index % 3 === 1
                                ? "linear-gradient(145deg,#E2F2EC,#DDE4F8)"
                                : "linear-gradient(145deg,#F5E5F6,#F9E5CD)",
                        }}
                      >
                        {meta.emoji}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="truncate font-bold text-stone-800">{pixel.name}</h3>
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100 text-sm text-stone-500 transition group-hover:bg-stone-900 group-hover:text-white">
                            ↗
                          </span>
                        </div>
                        {pixel.place_name ? (
                          <p className="mt-1 truncate text-[11px] font-bold text-rose-500">
                            📍 {pixel.place_name}
                          </p>
                        ) : null}
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-500">
                          {pixel.description || "설명이 없습니다."}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <BottomNav active="home" />
    </div>
  );
}
