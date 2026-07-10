"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Pixel } from "@/types/pixel";
import {
  FLOWER_CENTER_COLOR,
  FLOWER_PALETTE,
  FLOWER_PIXELS,
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
    container: "h-[200px] w-[200px]",
    pixel: "h-3.5 w-3.5",
    ring: "h-2 w-5",
  },
  md: {
    container: "h-[260px] w-[260px]",
    pixel: "h-[18px] w-[18px]",
    ring: "h-2.5 w-6",
  },
  lg: {
    container: "h-[300px] w-[300px] sm:h-[320px] sm:w-[320px]",
    pixel: "h-[22px] w-[22px] sm:h-6 sm:w-6",
    ring: "h-4 w-9",
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
    const copiedPixels = pixels.map((pixel) => ({ ...pixel }));
    const petalSlots = copiedPixels.filter(
      (pixel) => pixel.region === "petal",
    );

    dbPixels.slice(0, petalSlots.length).forEach((dbPixel, index) => {
      const target = petalSlots[index];

      target.state = "filled";
      target.uid = dbPixel.uid;
      target.color = FLOWER_PALETTE[index % FLOWER_PALETTE.length];
      target.memory = {
        title: dbPixel.name,
        category: "Memory",
        description: dbPixel.description ?? "",
        location: "",
      };
    });

    return copiedPixels;
  }, [dbPixels, pixels]);

  const centerPixels = displayPixels.filter(
    (pixel) => pixel.region === "center",
  );
  const petalPixels = displayPixels.filter(
    (pixel) => pixel.region === "petal",
  );

  return (
    <div
      className={`relative mx-auto ${className}`}
      aria-label={`${Math.min(dbPixels.length, petalPixels.length)}개의 추억이 채워진 꽃`}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 scale-110 rounded-full bg-gradient-to-b from-rose-200/40 via-amber-100/30 to-violet-200/40 blur-3xl"
        aria-hidden
      />

      <div className="absolute left-1/2 top-[6%] z-20 -translate-x-1/2 -translate-y-1/2">
        <div
          className={`${styles.ring} rounded-full border-[3px] border-stone-300/80 bg-gradient-to-b from-white via-stone-50 to-stone-200/70 shadow-sm`}
          aria-hidden
        />
        <div
          className="absolute left-1/2 top-full h-4 w-0.5 -translate-x-1/2 bg-gradient-to-b from-stone-300/80 to-stone-300/20"
          aria-hidden
        />
      </div>

      <div className="rounded-[2.25rem] bg-white/50 p-1 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.14)] ring-1 ring-white/90 backdrop-blur-md">
        <div
          className={`relative ${styles.container} rounded-[2rem] bg-gradient-to-b from-white/90 via-white/70 to-stone-50/50`}
        >
          {centerPixels.map((pixel) => (
            <div
              key={pixel.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${styles.pixel} shadow-inner`}
              style={{
                left: `${pixel.x}%`,
                top: `${pixel.y}%`,
                backgroundColor: FLOWER_CENTER_COLOR,
              }}
              aria-hidden
            />
          ))}

          {petalPixels.map((pixel) => {
            const isFilled = pixel.state === "filled" && Boolean(pixel.uid);

            return (
              <button
                key={pixel.id}
                type="button"
                onClick={() =>
                  isFilled
                    ? router.push(`/pixel/${pixel.uid}`)
                    : router.push("/add")
                }
                aria-label={
                  isFilled && pixel.memory
                    ? `${pixel.memory.title} 열기`
                    : "새 Pixel 만들기"
                }
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${styles.pixel} transition duration-200 hover:z-10 hover:scale-[1.18] active:scale-90 ${
                  isFilled
                    ? "shadow-[inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-3px_6px_rgba(0,0,0,0.1),0_3px_8px_rgba(0,0,0,0.08)]"
                    : "bg-stone-200/70 shadow-inner hover:ring-2 hover:ring-pink-300"
                }`}
                style={{
                  left: `${pixel.x}%`,
                  top: `${pixel.y}%`,
                  ...(isFilled && pixel.color
                    ? { backgroundColor: pixel.color }
                    : {}),
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
