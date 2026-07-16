"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PixelFlower } from "@/components/flower/PixelFlower";
import { FLOWER_TOTAL_COUNT } from "@/components/flower/flowerData";
import { BottomNav } from "@/components/ui/BottomNav";
import { CompletionCard } from "@/components/ui/CompletionCard";
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
      const queryMatches = !normalizedQuery || searchable.includes(normalizedQuery);

      return categoryMatches && queryMatches;
    });
  }, [category, pixels, query]);

  const filledCount = Math.min(pixels.length, FLOWER_TOTAL_COUNT);
  const percentage = Math.round((filledCount / FLOWER_TOTAL_COUNT) * 100);

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-warm-gradient">
      <main className="safe-top mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-28">
        <header className="mt-1 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-500">
            Pixel Key
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Pixel Bloom</h1>
          <p className="mt-2 text-stone-500">
            좋아하는 장소와 순간을 꽃 한 송이에 모아보세요.
          </p>
        </header>

        <section className="mt-6 flex justify-center">
          <PixelFlower size="lg" dbPixels={pixels} />
        </section>

        <section className="mt-8">
          <CompletionCard
            filled={filledCount}
            total={FLOWER_TOTAL_COUNT}
            percentage={percentage}
          />
        </section>

        <section className="mt-6">
          <PrimaryButton onClick={() => router.push("/add")}>
            + 새 Pixel 만들기
          </PrimaryButton>
        </section>

        <section className="mt-8 space-y-3">
          <label htmlFor="pixel-search" className="sr-only">
            Pixel 검색
          </label>
          <input
            id="pixel-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="장소나 추억을 검색하세요"
            className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3.5 text-sm shadow-sm outline-none backdrop-blur transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
          />

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold ${
                category === "all"
                  ? "bg-stone-900 text-white"
                  : "border border-white bg-white/70 text-stone-600"
              }`}
            >
              전체
            </button>
            {CATEGORY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setCategory(option.value)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold ${
                  category === option.value
                    ? "bg-stone-900 text-white"
                    : "border border-white bg-white/70 text-stone-600"
                }`}
              >
                {option.emoji} {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-lg font-semibold">내 Pixel</h2>
            {!loading && !error ? (
              <span className="text-xs font-medium text-stone-400">
                {filteredPixels.length}개
              </span>
            ) : null}
          </div>

          {loading ? (
            <p className="rounded-2xl bg-white/60 p-6 text-center text-stone-500">
              추억을 불러오는 중...
            </p>
          ) : error ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-700">
              {error}
            </p>
          ) : filteredPixels.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-stone-300 bg-white/35 p-8 text-center text-stone-500">
              {pixels.length === 0
                ? "아직 만든 Pixel이 없습니다. 첫 추억을 기록해보세요."
                : "검색 조건에 맞는 Pixel이 없습니다."}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredPixels.map((pixel) => {
                const meta = getCategoryMeta(pixel.category);
                return (
                  <button
                    key={pixel.uid}
                    type="button"
                    onClick={() => router.push(`/pixel/${pixel.uid}`)}
                    className="w-full rounded-2xl border border-white/80 bg-white/80 p-4 text-left shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-xl">
                        {meta.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="truncate font-semibold">{pixel.name}</h3>
                          <span className="shrink-0 text-stone-400">→</span>
                        </div>
                        {pixel.place_name ? (
                          <p className="mt-1 truncate text-xs font-medium text-orange-600">
                            📍 {pixel.place_name}
                          </p>
                        ) : null}
                        <p className="mt-1 line-clamp-2 text-sm leading-5 text-stone-500">
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
