"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { MapPicker } from "@/components/map/MapPicker";
import {
  deleteImage,
  getPixel,
  updatePixel,
  uploadImage,
} from "@/lib/pixel";
import { CATEGORY_OPTIONS } from "@/lib/pixel-category";
import type {
  Pixel,
  PixelCategory,
  PlaceSelection,
} from "@/types/pixel";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

function pixelToPlace(pixel: Pixel): PlaceSelection | null {
  if (
    !pixel.place_name &&
    !pixel.address_name &&
    !pixel.road_address_name &&
    pixel.lat === null &&
    pixel.lng === null
  ) {
    return null;
  }

  return {
    placeName: pixel.place_name || "",
    addressName: pixel.address_name || "",
    roadAddressName: pixel.road_address_name || "",
    placeUrl: pixel.place_url || "",
    lat: pixel.lat,
    lng: pixel.lng,
  };
}

export default function EditPixelPage() {
  const params = useParams<{ uid: string }>();
  const router = useRouter();

  const [pixel, setPixel] = useState<Pixel | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visitedAt, setVisitedAt] = useState("");
  const [category, setCategory] = useState<PixelCategory>("other");
  const [place, setPlace] = useState<PlaceSelection | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getPixel(params.uid);
        if (cancelled) return;

        if (!data) {
          setError("수정할 Pixel을 찾을 수 없습니다.");
          return;
        }

        setPixel(data);
        setName(data.name);
        setDescription(data.description || "");
        setVisitedAt(data.visited_at || "");
        setCategory(data.category || "other");
        setPlace(pixelToPlace(data));
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Pixel을 불러오지 못했습니다.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [params.uid]);

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
    setRemoveCurrentImage(false);
  }

  function resetNewImage() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview("");
    setImageFile(null);
  }

  async function handleSave() {
    if (!pixel) return;

    if (!name.trim()) {
      alert("Pixel 이름을 입력해주세요.");
      return;
    }

    let uploadedImageUrl: string | null = null;

    try {
      setSaving(true);

      if (imageFile) {
        uploadedImageUrl = await uploadImage(imageFile);
      }

      const nextImage = uploadedImageUrl
        ? uploadedImageUrl
        : removeCurrentImage
          ? null
          : pixel.image;

      await updatePixel(pixel.uid, {
        name,
        description,
        image: nextImage,
        visitedAt,
        category,
        place,
      });

      if (pixel.image && pixel.image !== nextImage) {
        await deleteImage(pixel.image).catch((cleanupError) => {
          console.warn("이전 사진 정리에 실패했습니다.", cleanupError);
        });
      }

      router.replace(`/pixel/${pixel.uid}`);
      router.refresh();
    } catch (saveError) {
      if (uploadedImageUrl) {
        await deleteImage(uploadedImageUrl).catch(() => undefined);
      }

      alert(
        saveError instanceof Error
          ? saveError.message
          : "수정에 실패했습니다.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-warm-gradient text-stone-500">
        수정 화면을 준비하는 중...
      </main>
    );
  }

  if (!pixel || error) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-warm-gradient px-6 text-center">
        <p className="font-semibold text-stone-800">
          {error || "수정할 Pixel을 찾을 수 없습니다."}
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="rounded-xl bg-stone-900 px-5 py-3 font-semibold text-white"
        >
          홈으로 돌아가기
        </button>
      </main>
    );
  }

  const visibleImage = preview || (!removeCurrentImage ? pixel.image || "" : "");

  return (
    <div className="min-h-dvh bg-warm-gradient">
      <main className="safe-top mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-12">
        <header className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-stone-600 shadow-sm backdrop-blur"
          >
            ← 취소
          </button>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
            Edit Memory
          </span>
        </header>

        <section className="mb-7">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">
            추억 수정하기
          </h1>
          <p className="mt-2 leading-6 text-stone-500">
            사진과 장소, 그날의 이야기를 다시 다듬어보세요.
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

          <MapPicker key={pixel.uid} value={place} onChange={setPlace} />

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
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 px-5 py-6 text-center transition hover:border-orange-300 hover:bg-orange-50"
            >
              <span className="text-2xl" aria-hidden>📷</span>
              <strong className="mt-2 text-sm text-stone-700">
                새 사진으로 변경
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

            {visibleImage ? (
              <div className="relative mt-4 overflow-hidden rounded-2xl">
                <Image
                  src={visibleImage}
                  alt="대표 사진 미리보기"
                  width={800}
                  height={600}
                  unoptimized
                  className="h-64 w-full object-cover"
                />
                <div className="absolute right-3 top-3 flex gap-2">
                  {preview ? (
                    <button
                      type="button"
                      onClick={resetNewImage}
                      className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-stone-700 shadow backdrop-blur"
                    >
                      변경 취소
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      resetNewImage();
                      setRemoveCurrentImage(true);
                    }}
                    className="rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur"
                  >
                    사진 삭제
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-3 rounded-xl bg-stone-100 px-4 py-3 text-center text-xs font-semibold text-stone-400">
                저장할 대표 사진이 없습니다.
              </p>
            )}
          </section>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mt-6 rounded-2xl bg-stone-900 p-4 font-semibold text-white shadow-[0_16px_36px_-16px_rgba(0,0,0,0.65)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "변경사항 저장 중..." : "수정 내용 저장하기"}
        </button>
      </main>
    </div>
  );
}
