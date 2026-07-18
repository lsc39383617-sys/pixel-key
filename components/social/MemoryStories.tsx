"use client";

import { useRouter } from "next/navigation";

import { getCategoryMeta } from "@/lib/pixel-category";
import type { Pixel } from "@/types/pixel";

type MemoryStoriesProps = {
  pixels: Pixel[];
};

const STORY_BACKGROUNDS = [
  "linear-gradient(145deg,#ffdfd7,#f6b8cd)",
  "linear-gradient(145deg,#d9ecff,#b5cff5)",
  "linear-gradient(145deg,#e8dcff,#c8b8ed)",
  "linear-gradient(145deg,#d9f4e6,#9fd4b4)",
  "linear-gradient(145deg,#ffe9ba,#f3bf72)",
];

export function MemoryStories({ pixels }: MemoryStoriesProps) {
  const router = useRouter();
  const recent = pixels.slice(0, 7);

  return (
    <section aria-label="최근 추억" className="mt-5">
      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => router.push("/add")}
          className="group shrink-0 text-center"
        >
          <span className="relative mx-auto flex h-[66px] w-[66px] items-center justify-center rounded-full bg-[linear-gradient(145deg,#ff7d9b,#ffb56b)] p-[2px] shadow-[0_8px_22px_rgba(238,105,135,0.24)] transition group-hover:-translate-y-1">
            <span className="flex h-full w-full items-center justify-center rounded-full border-[3px] border-[#fff8f2] bg-white text-2xl font-light text-stone-800">
              +
            </span>
          </span>
          <span className="mt-2 block max-w-[70px] truncate text-[11px] font-bold text-stone-700">
            새 추억
          </span>
        </button>

        {recent.map((pixel, index) => {
          const meta = getCategoryMeta(pixel.category);

          return (
            <button
              key={pixel.uid}
              type="button"
              onClick={() => router.push(`/pixel/${pixel.uid}`)}
              className="group shrink-0 text-center"
            >
              <span className="relative mx-auto block h-[66px] w-[66px] rounded-full bg-[linear-gradient(145deg,#ff8ea7,#ffbd78,#8dd9ba)] p-[2px] shadow-[0_8px_22px_rgba(111,84,88,0.16)] transition group-hover:-translate-y-1">
                <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border-[3px] border-[#fff8f2] bg-white">
                  {pixel.image ? (
                    <img
                      src={pixel.image}
                      alt=""
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <span
                      className="flex h-full w-full items-center justify-center text-2xl"
                      style={{ background: STORY_BACKGROUNDS[index % STORY_BACKGROUNDS.length] }}
                    >
                      {meta.emoji}
                    </span>
                  )}
                </span>
              </span>
              <span className="mt-2 block max-w-[74px] truncate text-[11px] font-semibold text-stone-600">
                {pixel.place_name || pixel.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
