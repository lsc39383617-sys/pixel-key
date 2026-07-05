"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PixelFlower } from "@/components/flower/PixelFlower";
import { BottomNav } from "@/components/ui/BottomNav";
import { CompletionCard } from "@/components/ui/CompletionCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { getPixels } from "@/lib/pixel";
import { Pixel } from "@/types/pixel";

const FLOWER_TOTAL_COUNT = 12;

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

  return (
    <div className="relative bg-warm-gradient min-h-dvh overflow-x-hidden">
      <main className="safe-top mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-28">

        <header className="mt-6 text-center">
          <h1 className="text-2xl font-bold">Pixel Bloom</h1>
          <p className="mt-2 text-stone-500">
            나만의 추억을 Pixel로 기록해보세요.
          </p>
        </header>

        <section className="mt-6 flex justify-center">
  <PixelFlower
    size="lg"
    dbPixels={pixels}
  />
</section>  

        <section className="mt-8">
        <CompletionCard
  filled={pixels.length}
  total={FLOWER_TOTAL_COUNT}
  percentage={Math.round((pixels.length / FLOWER_TOTAL_COUNT) * 100)}
/>
        </section>

        <section className="mt-6 flex flex-col gap-3">
          <PrimaryButton onClick={() => router.push("/add")}>
            + 새 Pixel 만들기
          </PrimaryButton>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">
            내 Pixel
          </h2>

          {loading ? (
            <p>불러오는 중...</p>
          ) : pixels.length === 0 ? (
            <p className="text-stone-500">
              아직 만든 Pixel이 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {pixels.map((pixel) => (
                <button
                  key={pixel.uid}
                  onClick={() => router.push(`/pixel/${pixel.uid}`)}
                  className="w-full rounded-xl border bg-white p-4 text-left shadow-sm transition hover:shadow-md"
                >
                  <h3 className="font-semibold">{pixel.name}</h3>

                  <p className="mt-1 text-sm text-stone-500">
                    {pixel.description}
                  </p>
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