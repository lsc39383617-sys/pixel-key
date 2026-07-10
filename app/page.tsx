"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PixelFlower } from "@/components/flower/PixelFlower";
import { FLOWER_TOTAL_COUNT } from "@/components/flower/flowerData";
import { BottomNav } from "@/components/ui/BottomNav";
import { CompletionCard } from "@/components/ui/CompletionCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { getPixels } from "@/lib/pixel";
import { Pixel } from "@/types/pixel";

export default function HomePage() {
  const router = useRouter();
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getPixels();
      setPixels(data);
      setLoading(false);
    }

    load();
  }, []);

  const filledCount = Math.min(pixels.length, FLOWER_TOTAL_COUNT);
  const percentage = Math.round((filledCount / FLOWER_TOTAL_COUNT) * 100);

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-warm-gradient">
      <main className="safe-top mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-28">
        <header className="mt-6 text-center">
          <h1 className="text-2xl font-bold">Pixel Bloom</h1>
          <p className="mt-2 text-stone-500">
            나만의 추억을 Pixel로 기록해보세요.
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

        <section className="mt-6 flex flex-col gap-3">
          <PrimaryButton onClick={() => router.push("/add")}>
            + 새 Pixel 만들기
          </PrimaryButton>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">내 Pixel</h2>

          {loading ? (
            <p className="text-stone-500">불러오는 중...</p>
          ) : pixels.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
              아직 만든 Pixel이 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {pixels.map((pixel) => (
                <button
                  key={pixel.uid}
                  type="button"
                  onClick={() => router.push(`/pixel/${pixel.uid}`)}
                  className="w-full rounded-2xl border border-white/80 bg-white/80 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">{pixel.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-stone-500">
                        {pixel.description || "설명이 없습니다."}
                      </p>
                    </div>
                    <span className="shrink-0 text-stone-400">→</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav active="home" />
    </div>
  );
}
