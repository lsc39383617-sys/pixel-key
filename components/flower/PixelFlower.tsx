"use client";
console.log("🔥 PixelFlower render", dbPixels.length);
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FLOWER_CENTER_COLOR,
  FLOWER_FILLED_COUNT,
  FLOWER_PIXELS,
  FLOWER_TOTAL_COUNT,
  type FlowerPixel,
} from "./flowerData";
import { MemoryModal } from "./MemoryModal";
import { Pixel } from "@/types/pixel";

type PixelFlowerProps = {
  pixels?: FlowerPixel[];
  dbPixels?: Pixel[];
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
  dbPixels = [],
  size = "lg",
  className = "",
}: PixelFlowerProps) {
  console.log("🔥 PixelFlower render");
console.log("dbPixels:", dbPixels);
  console.log("🔥 PixelFlower render");
  const styles = sizeStyles[size];
  const router = useRouter();

  const [clickedId, setClickedId] = useState<number | null>(null);
  const [selectedPixel, setSelectedPixel] = useState<FlowerPixel | null>(null);

  const handlePixelClick = useCallback(
    (pixel: FlowerPixel) => {
      if (pixel.region !== "petal") return;

      if (pixel.uid) {
        router.push(`/pixel/${pixel.uid}`);
        return;
      }

      if (pixel.state !== "filled" || !pixel.memory) return;

      setClickedId(pixel.id);
      setSelectedPixel(pixel);
    },
    [router]
  );

  useEffect(() => {
    if (clickedId === null) return;
    const timer = window.setTimeout(() => setClickedId(null), 300);
    return () => window.clearTimeout(timer);
  }, [clickedId]);

  const closeModal = useCallback(() => setSelectedPixel(null), []);

  // ✅ 핵심: 데이터 합성
  const displayPixels = useMemo(() => {
    const copy = pixels.map((p) => ({ ...p }));
  
    const petalPixels = copy.filter((p) => p.region === "petal");
  
    // 🔥 DB는 uid 기준으로만 매핑
    const used = new Set<number>();
  
    dbPixels.forEach((dbPixel) => {
      const target = petalPixels.find((p) => {
        if (used.has(p.id)) return false;
        return p.region === "petal" && p.uid == null;
      });
  
      if (!target) return;
  
      used.add(target.id);
  
      target.state = "filled";
      target.uid = dbPixel.uid;
      target.color = "#FFB5BA";
  
      target.memory = {
        title: dbPixel.name,
        category: "Memory",
        description: dbPixel.description,
        location: "",
      };
    });
  
    return copy;
  }, [pixels, dbPixels]); 

  const centerPixels = displayPixels.filter((p) => p.region === "center");
  const petalPixels = displayPixels.filter((p) => p.region === "petal");

  return (
    <>
      <div className={`relative mx-auto ${className}`}>
        <div
          className="pointer-events-none absolute inset-0 -z-10 scale-110 rounded-full bg-gradient-to-b from-rose-200/40 via-amber-100/30 to-violet-200/40 blur-3xl"
        />

        <div className="rounded-[2.25rem] bg-white/50 p-1">
          <div className={`relative ${styles.container} rounded-[2rem] bg-white/80`}>
            
            {/* center */}
            {centerPixels.map((pixel) => (
              <div
                key={pixel.id}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${styles.pixel}`}
                style={{
                  left: `${pixel.x}%`,
                  top: `${pixel.y}%`,
                  backgroundColor: FLOWER_CENTER_COLOR,
                }}
              />
            ))}

            {/* petal */}
            {petalPixels.map((pixel) => {
              const isFilled = pixel.state === "filled";
              const isClicked = clickedId === pixel.id;

              const baseClass = `absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${styles.pixel}`;

              const style = {
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
                    className={baseClass}
                    style={style}
                    onClick={() => router.push("/add")}
                  />
                );
              }

              return (
                <button
                  key={pixel.id}
                  className={baseClass}
                  style={style}
                  onClick={() => handlePixelClick(pixel)}
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