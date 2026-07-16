"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPicker } from "@/components/map/MapPicker";
import { createPixel, uploadImage } from "@/lib/pixel";
import { CATEGORY_OPTIONS } from "@/lib/pixel-category";
import type { PixelCategory, PlaceSelection } from "@/types/pixel";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

export default function AddPixelPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visitedAt, setVisitedAt] = useState("");
  const [category, setCategory] = useState<PixelCategory>("other");
  const [place, setPlace] = useState<PlaceSelection | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 선택할 수 있습니다.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      alert("이미지는 8MB 이하만 업로드할 수 있습니다.");
      event.target.value = "";
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (!name.trim()) {
      alert("Pixel 이름을 입력해주세요.");
      return;
    }

    try {
      setSaving(true);
      const imageUrl = imageFile ? await uploadImage(imageFile) : "";
      const pixel = await createPixel({
        name,
        description,
        image: imageUrl,
        visitedAt,
        category,
        place,
      });

      router.push(`/pixel/${pixel.uid}`);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-dvh bg-warm-gradient">
      <main className="safe-top mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-12">
        <header className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-stone-600 shadow-sm backdrop-blur"
          >
            ← 돌아가기
          </button>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
            New Memory
          </span>
        </header>

        <section className="mb-7">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">
            새 Pixel 만들기
          </h1>
          <p className="mt-2 leading-6 text-stone-500">
            사진, 날짜, 장소를 함께 기록하면 꽃 속의 추억이 더 선명해져요.
          </p>
        </section>

        <div className="space-y-7 rounded-[2rem] border border-white/80 bg-white/75 p-5 shadow-[0_24px_70px_-40px_rgba(70,45,30,0.45)] backdrop-blur-xl">
          <section>
            <label className="mb-2 block font-semibold" htmlFor="pixel-name">
              이름 <span className="text-rose-500">*</span>
            </label>
            <input
              id="pixel-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3.5 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
              placeholder="예: 양림동에서 마신 첫 커피"
              maxLength={60}
            />
          </section>

          <section>
            <p className="mb-3 font-semibold">카테고리</p>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORY_OPTIONS.map((option) => {
                const selected = category === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setCategory(option.value)}
                    className={`rounded-2xl border px-2 py-3 text-sm font-semibold transition active:scale-[0.98] ${
                      selected
                        ? "border-stone-900 bg-stone-900 text-white shadow-md"
                        : "border-stone-200 bg-white text-stone-600"
                    }`}
                  >
                    <span className="mb-1 block text-lg" aria-hidden>
                      {option.emoji}
                    </span>
                    {option.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <label className="mb-2 block font-semibold" htmlFor="visited-at">
              방문 날짜
            </label>
            <input
              id="visited-at"
              type="date"
              value={visitedAt}
              onChange={(event) => setVisitedAt(event.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3.5 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
            />
          </section>

          <MapPicker value={place} onChange={setPlace} />

          <section>
            <label className="mb-2 block font-semibold" htmlFor="pixel-description">
              추억
            </label>
            <textarea
              id="pixel-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full resize-none rounded-xl border border-stone-200 bg-white px-4 py-3.5 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
              rows={6}
              placeholder="이 장소에서 무엇을 보고, 먹고, 느꼈는지 적어보세요."
              maxLength={800}
            />
            <p className="mt-2 text-right text-xs text-stone-400">
              {description.length}/800
            </p>
          </section>

          <section>
            <label className="mb-2 block font-semibold" htmlFor="pixel-image">
              대표 사진
            </label>
            <label
              htmlFor="pixel-image"
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 px-5 py-7 text-center transition hover:border-orange-300 hover:bg-orange-50"
            >
              <span className="text-2xl" aria-hidden>
                📷
              </span>
              <strong className="mt-2 text-sm text-stone-700">
                사진을 선택하세요
              </strong>
              <span className="mt-1 text-xs text-stone-400">최대 8MB</span>
            </label>
            <input
              id="pixel-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="sr-only"
            />

            {preview ? (
              <div className="relative mt-4 overflow-hidden rounded-2xl">
                <Image
                  src={preview}
                  alt="선택한 사진 미리보기"
                  width={800}
                  height={600}
                  unoptimized
                  className="h-64 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    URL.revokeObjectURL(preview);
                    setPreview("");
                    setImageFile(null);
                  }}
                  className="absolute right-3 top-3 rounded-full bg-black/65 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur"
                >
                  사진 삭제
                </button>
              </div>
            ) : null}
          </section>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mt-6 rounded-2xl bg-stone-900 p-4 font-semibold text-white shadow-[0_16px_36px_-16px_rgba(0,0,0,0.65)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Pixel을 저장하는 중..." : "이 추억 저장하기"}
        </button>
      </main>
    </div>
  );
}
