"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { Pixel } from "@/types/pixel";

import {
  FLOWER_GRID_SIZE,
  FLOWER_PIXELS,
  ORDERED_FLOWER_MEMORY_SLOTS,
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
    shell: "h-[250px] w-[250px]",
    canvas: "h-[205px] w-[205px]",
    ring: "h-7 w-12",
  },
  md: {
    shell: "h-[310px] w-[310px]",
    canvas: "h-[260px] w-[260px]",
    ring: "h-8 w-14",
  },
  lg: {
    shell:
      "h-[360px] w-[360px] sm:h-[390px] sm:w-[390px]",
    canvas:
      "h-[310px] w-[310px] sm:h-[335px] sm:w-[335px]",
    ring: "h-9 w-16",
  },
} as const;

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
      state:
        pixel.region === "petal"
          ? ("empty" as const)
          : ("filled" as const),
    }));

    const orderedKeys =
      ORDERED_FLOWER_MEMORY_SLOTS.map(
        (slot) => `${slot.row}-${slot.col}`,
      );

    const orderedSlots = orderedKeys
      .map((key) =>
        copiedPixels.find(
          (pixel) =>
            pixel.region === "petal" &&
            `${pixel.row}-${pixel.col}` === key,
        ),
      )
      .filter(Boolean) as FlowerPixel[];

    dbPixels
      .slice(0, orderedSlots.length)
      .forEach((dbPixel, index) => {
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
    (pixel) =>
      pixel.region === "petal" &&
      pixel.state === "filled" &&
      Boolean(pixel.uid),
  ).length;

  return (
    <div
      className={`relative mx-auto ${className}`}
      role="group"
      aria-label={`${filledCount}개의 취향이 채워진 픽셀 꽃`}
    >
      <div
        className="pointer-events-none absolute inset-[4%] -z-10 rounded-full bg-gradient-to-br from-orange-100/80 via-rose-50/60 to-teal-100/70 blur-3xl"
        aria-hidden
      />

      <div className="absolute left-1/2 top-0 z-30 -translate-x-1/2 -translate-y-[42%]">
        <div
          className={`${styles.ring} rounded-full border-[5px] border-stone-300/90 bg-white shadow-[0_4px_13px_rgba(0,0,0,0.17),inset_0_2px_2px_white]`}
          aria-hidden
        />

        <div
          className="absolute left-1/2 top-full h-7 w-[4px] -translate-x-1/2 bg-gradient-to-b from-stone-300 to-stone-100"
          aria-hidden
        />
      </div>

      <div
        className={`${styles.shell} relative flex items-center justify-center rounded-[29%] border-[3px] border-white/95 bg-white/55 shadow-[0_28px_70px_-28px_rgba(65,43,37,0.42),inset_0_0_0_2px_rgba(255,255,255,0.8)] backdrop-blur-xl`}
      >
        <div
          className="pointer-events-none absolute inset-[3%] rounded-[27%] border border-stone-200/60 bg-gradient-to-b from-white/65 to-stone-50/25"
          aria-hidden
        />

        <div className={`${styles.canvas} relative z-10`}>
          <div
            className="grid h-full w-full gap-[1px]"
            style={{
              gridTemplateColumns: `repeat(${FLOWER_GRID_SIZE}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${FLOWER_GRID_SIZE}, minmax(0, 1fr))`,
            }}
          >
            {displayPixels.map((pixel) => {
              const isMemoryPixel =
                pixel.region === "petal";

              const isFilledMemory =
                isMemoryPixel &&
                pixel.state === "filled" &&
                Boolean(pixel.uid);

              const backgroundColor =
                isFilledMemory
                  ? pixel.filledColor
                  : pixel.guideColor;

              const pixelStyle = {
                gridColumn: pixel.col + 1,
                gridRow: pixel.row + 1,
                backgroundColor,
              };

              if (!isMemoryPixel) {
                return (
                  <div
                    key={pixel.id}
                    className="relative border border-[#938C82]/40 shadow-[inset_1px_1px_0_rgba(255,255,255,0.5)]"
                    style={pixelStyle}
                    aria-hidden
                  >
                    <span className="absolute left-[8%] top-[7%] h-[20%] w-[48%] bg-white/22" />
                  </div>
                );
              }

              return (
                <button
                  key={pixel.id}
                  type="button"
                  onClick={() => {
                    if (
                      isFilledMemory &&
                      pixel.uid
                    ) {
                      router.push(
                        `/pixel/${pixel.uid}`,
                      );
                      return;
                    }

                    router.push("/add");
                  }}
                  aria-label={
                    isFilledMemory && pixel.memory
                      ? `${pixel.memory.title} 열기`
                      : "새로운 추억 추가하기"
                  }
                  className={`group relative border transition-all duration-150 hover:z-20 hover:scale-[1.28] active:scale-90 ${
                    isFilledMemory
                      ? "border-[#6F675E]/45 shadow-[inset_1px_1px_0_rgba(255,255,255,0.28),2px_2px_0_rgba(75,55,45,0.12)]"
                      : "border-[#A9A196]/28 shadow-[inset_1px_1px_0_rgba(255,255,255,0.68)] hover:border-orange-400 hover:brightness-95"
                  }`}
                  style={pixelStyle}
                >
                  <span
                    className={`pointer-events-none absolute left-[8%] top-[7%] h-[20%] w-[48%] ${
                      isFilledMemory
                        ? "bg-white/22"
                        : "bg-white/38"
                    }`}
                    aria-hidden
                  />

                  {!isFilledMemory && (
                    <span className="pointer-events-none flex h-full w-full items-center justify-center text-[8px] font-bold text-stone-500 opacity-0 transition-opacity group-hover:opacity-60">
                      +
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="pointer-events-none absolute left-[11%] top-[8%] h-[27%] w-[16%] -rotate-12 rounded-full bg-white/30 blur-md"
          aria-hidden
        />
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm font-medium text-stone-600">
          {filledCount}개의 취향이 꽃을 채우고 있어요
        </p>

        <p className="mt-1 text-xs text-stone-400">
          연한 도트를 눌러 새로운 취향을 추가하세요
        </p>
      </div>
    </div>
  );
}