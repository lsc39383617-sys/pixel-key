"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FLOWER_CENTER_COLOR,
  FLOWER_FILLED_COUNT,
  FLOWER_PIXELS,
  FLOWER_TOTAL_COUNT,
  type FlowerPixel,
} from "./flowerData";
import { MemoryModal } from "./MemoryModal";

type PixelFlowerProps = {
  pixels?: FlowerPixel[];
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeStyles = {
  sm: { container: "h-[200px] w-[200px]", pixel: "h-3.5 w-3.5", ring: "h-2 w-5" },
  md: { container: "h-[260px] w-[260px]", pixel: "h-[18px] w-[18px]", ring: "h-2.5 w-6" },
  lg: {
    container: "h-[300px] w-[300px] sm:h-[320px] sm:w-[320px]",
    pixel: "h-[22px] w-[22px] sm:h-6 sm:w-6",
    ring: "h-4 w-9",
  },
} as const;

export function PixelFlower({
  pixels = FLOWER_PIXELS,
  size = "lg",
  className = "",
}: PixelFlowerProps) {
  const styles = sizeStyles[size];
  const [clickedId, setClickedId] = useState<number | null>(null);
  const [selectedPixel, setSelectedPixel] = useState<FlowerPixel | null>(null);

  const handlePixelClick = useCallback((pixel: FlowerPixel) => {
    if (pixel.region !== "petal" || pixel.state !== "filled" || !pixel.memory) {
      return;
    }
    setClickedId(pixel.id);
    setSelectedPixel(pixel);
  }, []);

  useEffect(() => {
    if (clickedId === null) return;
    const timer = window.setTimeout(() => setClickedId(null), 300);
    return () => window.clearTimeout(timer);
  }, [clickedId]);

  const closeModal = useCallback(() => setSelectedPixel(null), []);

  const centerPixels = pixels.filter((p) => p.region === "center");
  const petalPixels = pixels.filter((p) => p.region === "petal");

  return (
    <>
      <div
        className={`relative mx-auto ${className}`}
        role="img"
        aria-label={`Flower keyring with ${FLOWER_FILLED_COUNT} of ${FLOWER_TOTAL_COUNT} pixels filled`}
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10 scale-110 rounded-full bg-gradient-to-b from-rose-200/40 via-amber-100/30 to-violet-200/40 blur-3xl"
          aria-hidden
        />

        <div className="absolute left-1/2 top-[6%] z-20 -translate-x-1/2 -translate-y-1/2">
          <div
            className={`${styles.ring} rounded-full border-[3px] border-stone-300/80 bg-gradient-to-b from-white via-stone-50 to-stone-200/70 shadow-[0_2px_10px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]`}
            aria-hidden
          />
          <div
            className="absolute left-1/2 top-full h-4 w-0.5 -translate-x-1/2 bg-gradient-to-b from-stone-300/80 to-stone-300/20"
            aria-hidden
          />
        </div>

        <div className="rounded-[2.25rem] bg-white/50 p-1 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.14),0_4px_16px_-4px_rgba(0,0,0,0.06)] ring-1 ring-white/90 backdrop-blur-md">
          <div
            className={`relative ${styles.container} rounded-[2rem] bg-gradient-to-b from-white/90 via-white/70 to-stone-50/50`}
          >
            {centerPixels.map((pixel) => (
              <div
                key={pixel.id}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${styles.pixel} shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),inset_0_-2px_4px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.06)]`}
                style={{
                  left: `${pixel.x}%`,
                  top: `${pixel.y}%`,
                  backgroundColor: FLOWER_CENTER_COLOR,
                }}
                aria-hidden
              />
            ))}

            {petalPixels.map((pixel) => {
              const isFilled = pixel.state === "filled";
              const isClicked = clickedId === pixel.id;

              const pixelClassName = `absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${styles.pixel} ${
                isFilled
                  ? "cursor-pointer shadow-[inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-3px_6px_rgba(0,0,0,0.1),0_3px_8px_rgba(0,0,0,0.08)] transition-all duration-200 ease-out hover:scale-[1.18] hover:z-10 hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.55),inset_0_-3px_6px_rgba(0,0,0,0.12),0_6px_16px_rgba(0,0,0,0.14)] active:scale-90"
                  : "bg-stone-200/70 shadow-[inset_0_1px_3px_rgba(255,255,255,0.95),inset_0_-1px_2px_rgba(0,0,0,0.05)]"
              } ${isClicked ? "animate-pixel-pop z-10" : ""}`;

              const pixelStyle = {
                left: `${pixel.x}%`,
                top: `${pixel.y}%`,
                ...(isFilled && pixel.color
                  ? { backgroundColor: pixel.color }
                  : {}),
              };

              if (!isFilled) {
                return (
                  <button
                    key={pixel.id}
                    type="button"
                    onClick={() => {
                      alert("여기에 새로운 추억을 추가합니다!");
                    }}
                    aria-label="Add new memory"
                    className={`${pixelClassName} transition-all duration-200 hover:scale-110 hover:ring-2 hover:ring-pink-300`}
                    style={pixelStyle}
                  />
                );
              }

              return (
                <button
                  key={pixel.id}
                  type="button"
                  onClick={() => handlePixelClick(pixel)}
                  aria-label={
                    pixel.memory
                      ? `${pixel.memory.title}, ${pixel.memory.category}`
                      : `Memory pixel ${pixel.id + 1}`
                  }
                  className={pixelClassName}
                  style={pixelStyle}
                />
              );
            })}
          </div>
        </div>
      </div>

      {selectedPixel?.memory && selectedPixel.color && (
        <MemoryModal
          memory={selectedPixel.memory}
          color={selectedPixel.color}
          onClose={closeModal}
        />
      )}
    </>
  );
}
