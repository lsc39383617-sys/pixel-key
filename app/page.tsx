import { PixelFlower } from "@/components/flower/PixelFlower";
import {
  FLOWER_FILLED_COUNT,
  FLOWER_TOTAL_COUNT,
} from "@/components/flower/flowerData";
import { BottomNav } from "@/components/ui/BottomNav";
import { CompletionCard } from "@/components/ui/CompletionCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

const COMPLETION_PERCENTAGE = Math.round(
  (FLOWER_FILLED_COUNT / FLOWER_TOTAL_COUNT) * 100,
);

export default function HomePage() {
  return (
    <div className="relative bg-warm-gradient min-h-dvh overflow-x-hidden">
      <main className="safe-top relative mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-28 sm:px-6">
        <header className="animate-fade-up text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-white/60 px-3.5 py-1.5 shadow-sm ring-1 ring-white/80 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-rose-400 to-amber-300" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
              Pixel Bloom
            </span>
          </div>

          <h1 className="text-[2rem] font-semibold leading-[1.12] tracking-[-0.035em] text-stone-900 sm:text-[2.375rem]">
            Grow Your Color
          </h1>
          <p className="mx-auto mt-3 max-w-[19rem] text-[15px] leading-[1.5] text-stone-500">
            Collect your favorite places, food and memories into one beautiful
            flower.
          </p>
        </header>

        <section className="animate-fade-up animation-delay-200 mt-6 flex flex-1 flex-col items-center justify-center sm:mt-8">
          <div className="animate-float w-full max-w-[340px]">
            <PixelFlower size="lg" />
          </div>
          <p className="mt-4 text-center text-[13px] font-medium text-stone-400">
            Tap a pixel to preview your memories
          </p>
        </section>

        <section className="animate-fade-up animation-delay-300 mt-5 flex flex-col gap-3 sm:mt-6">
          <CompletionCard
            filled={FLOWER_FILLED_COUNT}
            total={FLOWER_TOTAL_COUNT}
            percentage={COMPLETION_PERCENTAGE}
          />
          <PrimaryButton className="animate-fade-up animation-delay-400">
            Start My Flower
          </PrimaryButton>
        </section>
      </main>

      <BottomNav active="home" />
    </div>
  );
}
