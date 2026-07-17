"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import type { Pixel } from "@/types/pixel";

import {
  FLOWER_GRID_SIZE,
  FLOWER_PETAL_COUNT,
  FLOWER_PIXELS,
  ORDERED_FLOWER_MEMORY_SLOTS,
  PETAL_GLOWS,
  PETAL_PALETTES,
  type FlowerPixel,
} from "./flowerData";

type PixelFlowerProps = {
  pixels?: FlowerPixel[];
  dbPixels?: Pixel[];
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeStyles = {
  sm: {
    shell: "h-[300px] w-[250px]",
    bloom: "h-[210px] w-[210px]",
    ring: "h-7 w-12",
    label: "text-[11px]",
  },
  md: {
    shell: "h-[365px] w-[310px]",
    bloom: "h-[270px] w-[270px]",
    ring: "h-8 w-14",
    label: "text-xs",
  },
  lg: {
    shell: "h-[440px] w-[360px] sm:w-[390px]",
    bloom: "h-[315px] w-[315px] sm:h-[330px] sm:w-[330px]",
    ring: "h-9 w-16",
    label: "text-sm",
  },
} as const;

const DECORATIVE_PETALS = Array.from({ length: FLOWER_PETAL_COUNT }, (_, index) => ({
  angle: index * (360 / FLOWER_PETAL_COUNT),
  color: PETAL_GLOWS[index],
}));

const SPARKLES = [
  { left: "17%", top: "20%", delay: "0ms", size: "h-2 w-2" },
  { left: "78%", top: "24%", delay: "700ms", size: "h-1.5 w-1.5" },
  { left: "86%", top: "48%", delay: "1300ms", size: "h-2.5 w-2.5" },
  { left: "12%", top: "52%", delay: "1900ms", size: "h-1.5 w-1.5" },
];

export function PixelFlower({
  pixels = FLOWER_PIXELS,
  dbPixels = [],
  size = "lg",
  className = "",
}: PixelFlowerProps) {
  const router = useRouter();
  const styles = sizeStyles[size];

  const displayPixels = useMemo(() => {
    const copiedPixels: FlowerPixel[] = pixels.map((pixel): FlowerPixel => ({
      ...pixel,
      uid: undefined,
      memory: undefined,
      state: pixel.region === "petal" ? "empty" : "filled",
    }));

    const copiedByPosition = new Map(
      copiedPixels.map((pixel) => [`${pixel.row}-${pixel.col}`, pixel]),
    );

    const orderedSlots = ORDERED_FLOWER_MEMORY_SLOTS.map((slot) =>
      copiedByPosition.get(`${slot.row}-${slot.col}`),
    ).filter((pixel): pixel is FlowerPixel => Boolean(pixel));

    dbPixels.slice(0, orderedSlots.length).forEach((dbPixel, index) => {
      const target = orderedSlots[index];
      target.state = "filled";
      target.uid = dbPixel.uid;
      target.memory = {
        title: dbPixel.name,
        category:
          dbPixel.category === "food" || dbPixel.category === "cafe"
            ? "Food"
            : dbPixel.place_name
              ? "Place"
              : "Memory",
        description: dbPixel.description ?? "",
        location: dbPixel.place_name ?? "",
      };
    });

    return copiedPixels;
  }, [dbPixels, pixels]);

  const filledCount = displayPixels.filter(
    (pixel) => pixel.region === "petal" && pixel.state === "filled" && pixel.uid,
  ).length;

  const totalCount = ORDERED_FLOWER_MEMORY_SLOTS.length;
  const progress = Math.min(100, Math.round((filledCount / totalCount) * 100));

  return (
    <div
      className={`relative mx-auto ${className}`}
      role="group"
      aria-label={`${filledCount}개의 추억이 피어난 픽셀 꽃`}
    >
      <div
        className="pointer-events-none absolute -inset-8 -z-20 rounded-full bg-[radial-gradient(circle,rgba(255,184,176,0.28),rgba(202,183,255,0.16)_42%,transparent_72%)] blur-2xl"
        aria-hidden
      />

      <div className="absolute left-1/2 top-0 z-40 -translate-x-1/2 -translate-y-[46%]">
        <div
          className={`${styles.ring} rounded-full border-[5px] border-[#D9D5CF] bg-gradient-to-b from-white via-[#F4F1EC] to-[#CFC9C1] shadow-[0_5px_16px_rgba(76,62,50,0.2),inset_0_2px_2px_white]`}
          aria-hidden
        />
        <div
          className="absolute left-1/2 top-full h-8 w-[4px] -translate-x-1/2 rounded-b-full bg-gradient-to-b from-[#CFC9C1] to-[#ECE8E2]"
          aria-hidden
        />
      </div>

      <div
        className={`${styles.shell} animate-flower-float relative overflow-hidden rounded-[32%_32%_29%_29%] border border-white/95 bg-white/55 shadow-[0_34px_80px_-35px_rgba(73,46,40,0.48),0_10px_30px_-18px_rgba(91,70,61,0.3),inset_0_0_0_1px_rgba(255,255,255,0.85)] backdrop-blur-xl`}
      >
        <div
          className="pointer-events-none absolute inset-[2.5%] rounded-[30%_30%_27%_27%] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.72),rgba(255,247,241,0.2)_52%,rgba(229,219,255,0.18))]"
          aria-hidden
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-[3%] top-[9%]" aria-hidden>
          <div className="absolute left-1/2 top-[51%] h-[36%] w-[5px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#82B96A] via-[#5D9A56] to-[#447C43] shadow-[0_2px_8px_rgba(63,116,65,0.28)]" />
          <div className="animate-leaf-sway absolute bottom-[18%] left-[31%] h-[15%] w-[24%] origin-bottom-right -rotate-[28deg] rounded-[90%_20%_85%_20%] bg-gradient-to-br from-[#A9D889] via-[#70B46D] to-[#4B8B51] shadow-[inset_3px_3px_8px_rgba(255,255,255,0.28),0_5px_12px_rgba(59,105,58,0.18)]" />
          <div className="animate-leaf-sway-reverse absolute bottom-[11%] right-[28%] h-[13%] w-[22%] origin-bottom-left rotate-[31deg] rounded-[20%_90%_20%_85%] bg-gradient-to-bl from-[#B8DF91] via-[#79B96A] to-[#4B8A4E] shadow-[inset_-3px_3px_8px_rgba(255,255,255,0.25),0_5px_12px_rgba(59,105,58,0.16)]" />
        </div>

        <div className="absolute left-1/2 top-[6%] z-10 -translate-x-1/2">
          <div className={`${styles.bloom} relative`}>
            <div className="pointer-events-none absolute inset-[7%] animate-bloom-pulse" aria-hidden>
              {DECORATIVE_PETALS.map((petal, index) => (
                <span
                  key={petal.angle}
                  className="absolute left-1/2 top-1/2 h-[48%] w-[30%] origin-[50%_93%] rounded-[58%_58%_44%_44%] border border-white/30 blur-[1px]"
                  style={{
                    background: `linear-gradient(180deg, rgba(255,255,255,0.42), ${petal.color})`,
                    transform: `translate(-50%, -93%) rotate(${petal.angle}deg) scale(${index % 2 === 0 ? 1.04 : 0.96})`,
                  }}
                />
              ))}
            </div>

            <div className="pointer-events-none absolute inset-[17%] rotate-[22.5deg] opacity-75" aria-hidden>
              {DECORATIVE_PETALS.map((petal) => (
                <span
                  key={`inner-${petal.angle}`}
                  className="absolute left-1/2 top-1/2 h-[39%] w-[25%] origin-[50%_93%] rounded-[60%_60%_44%_44%]"
                  style={{
                    background: `linear-gradient(180deg, rgba(255,255,255,0.55), ${petal.color})`,
                    transform: `translate(-50%, -93%) rotate(${petal.angle}deg)`,
                  }}
                />
              ))}
            </div>

            {SPARKLES.map((sparkle) => (
              <span
                key={`${sparkle.left}-${sparkle.top}`}
                className={`animate-flower-sparkle pointer-events-none absolute z-30 rounded-full bg-white shadow-[0_0_10px_3px_rgba(255,255,255,0.75)] ${sparkle.size}`}
                style={{ left: sparkle.left, top: sparkle.top, animationDelay: sparkle.delay }}
                aria-hidden
              />
            ))}

            <div
              className="absolute inset-[13%] z-20 grid gap-[1px] drop-shadow-[0_8px_12px_rgba(70,48,51,0.16)]"
              style={{
                gridTemplateColumns: `repeat(${FLOWER_GRID_SIZE}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${FLOWER_GRID_SIZE}, minmax(0, 1fr))`,
              }}
            >
              {displayPixels.map((pixel) => {
                const isMemoryPixel = pixel.region === "petal";
                const isFilledMemory = isMemoryPixel && pixel.state === "filled" && Boolean(pixel.uid);
                const backgroundColor = isFilledMemory ? pixel.filledColor : pixel.guideColor;
                const pixelStyle = {
                  gridColumn: pixel.col + 1,
                  gridRow: pixel.row + 1,
                  backgroundColor,
                };

                if (!isMemoryPixel) {
                  return (
                    <div
                      key={pixel.id}
                      className={`relative rounded-[2px] border shadow-[inset_1px_1px_0_rgba(255,255,255,0.42)] ${
                        pixel.region === "center-hole"
                          ? "border-amber-200/50"
                          : "border-amber-800/20"
                      }`}
                      style={pixelStyle}
                      aria-hidden
                    >
                      <span className="absolute left-[9%] top-[8%] h-[22%] w-[48%] rounded-full bg-white/30" />
                    </div>
                  );
                }

                return (
                  <button
                    key={pixel.id}
                    type="button"
                    onClick={() => {
                      if (isFilledMemory && pixel.uid) {
                        router.push(`/pixel/${pixel.uid}`);
                        return;
                      }
                      router.push("/add");
                    }}
                    aria-label={
                      isFilledMemory && pixel.memory
                        ? `${pixel.memory.title} 열기`
                        : "새로운 추억 추가하기"
                    }
                    title={isFilledMemory ? pixel.memory?.title : "새 Pixel 추가"}
                    className={`group relative rounded-[2px] border transition duration-200 hover:z-30 hover:scale-[1.34] hover:brightness-105 active:scale-90 ${
                      isFilledMemory
                        ? "border-white/28 shadow-[inset_1px_1px_0_rgba(255,255,255,0.38),1px_2px_3px_rgba(64,38,46,0.18)]"
                        : "border-white/42 opacity-82 shadow-[inset_1px_1px_0_rgba(255,255,255,0.62)] hover:border-rose-300 hover:opacity-100"
                    }`}
                    style={pixelStyle}
                  >
                    <span className="pointer-events-none absolute left-[9%] top-[8%] h-[20%] w-[48%] rounded-full bg-white/30" />
                    {!isFilledMemory ? (
                      <span className="pointer-events-none flex h-full w-full items-center justify-center text-[7px] font-black text-rose-700/50 opacity-0 transition-opacity group-hover:opacity-100">
                        +
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 h-[21%] w-[21%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-100/70 bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.8),rgba(255,205,91,0.32)_35%,rgba(214,128,30,0.18)_72%,transparent_74%)] shadow-[inset_0_3px_8px_rgba(255,255,255,0.55),0_4px_10px_rgba(136,78,24,0.16)]" aria-hidden />
          </div>
        </div>

        <div className="absolute bottom-[4.5%] left-1/2 z-20 w-[82%] -translate-x-1/2 rounded-2xl border border-white/80 bg-white/68 px-4 py-3 shadow-[0_8px_24px_rgba(78,59,53,0.1)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className={`${styles.label} font-bold text-stone-700`}>
                {filledCount}개의 추억이 피어났어요
              </p>
              <p className="mt-0.5 text-[10px] font-medium text-stone-400">
                꽃잎을 눌러 추억을 열어보세요
              </p>
            </div>
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-900 text-[11px] font-black text-white shadow-lg">
              {progress}%
              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 44 44" aria-hidden>
                <circle cx="22" cy="22" r="19" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="2" />
                <circle
                  cx="22"
                  cy="22"
                  r="19"
                  fill="none"
                  stroke="rgba(255,255,255,0.92)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 19}`}
                  strokeDashoffset={`${2 * Math.PI * 19 * (1 - progress / 100)}`}
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute left-[9%] top-[6%] h-[35%] w-[12%] -rotate-12 rounded-full bg-white/24 blur-md" aria-hidden />
      </div>
    </div>
  );
}
