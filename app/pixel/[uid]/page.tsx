"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { KakaoMap } from "@/components/map/KakaoMap";
import { deletePixel, getPixel } from "@/lib/pixel";
import { getCategoryMeta } from "@/lib/pixel-category";
import type { Pixel } from "@/types/pixel";

function formatVisitedDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export default function PixelPage() {
  const params = useParams<{ uid: string }>();
  const router = useRouter();
  const [pixel, setPixel] = useState<Pixel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getPixel(params.uid);
        if (!cancelled) setPixel(data);
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

  async function handleDelete() {
    if (!pixel || deleting) return;

    try {
      setDeleting(true);
      await deletePixel(pixel.uid, pixel.image);
      router.replace("/");
      router.refresh();
    } catch (deleteError) {
      alert(
        deleteError instanceof Error
          ? deleteError.message
          : "삭제에 실패했습니다.",
      );
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-warm-gradient text-stone-500">
        Pixel을 불러오는 중...
      </main>
    );
  }

  if (!pixel || error) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-warm-gradient px-6 text-center">
        <span className="text-4xl" aria-hidden>🌱</span>
        <p className="font-semibold text-stone-800">
          {error || "Pixel을 찾을 수 없습니다."}
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

  const category = getCategoryMeta(pixel.category);
  const hasLocation = pixel.lat !== null && pixel.lng !== null;
  const address = pixel.road_address_name || pixel.address_name;

  return (
    <div className="min-h-dvh bg-warm-gradient">
      <main className="safe-top mx-auto min-h-dvh max-w-md px-5 pb-12">
        <header className="mb-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-stone-600 shadow-sm backdrop-blur"
          >
            ← 돌아가기
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push(`/pixel/${pixel.uid}/edit`)}
              className="rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-bold text-stone-700 shadow-sm backdrop-blur transition active:scale-95"
            >
              수정
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-full border border-rose-100 bg-rose-50/90 px-4 py-2 text-sm font-bold text-rose-600 shadow-sm backdrop-blur transition active:scale-95"
            >
              삭제
            </button>
          </div>
        </header>

        <article className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 shadow-[0_28px_80px_-45px_rgba(60,40,30,0.6)] backdrop-blur-xl">
          {pixel.image ? (
            <Image
              src={pixel.image}
              alt={pixel.name}
              width={900}
              height={700}
              unoptimized
              priority
              className="h-80 w-full object-cover"
            />
          ) : (
            <div className="flex h-56 items-center justify-center bg-gradient-to-br from-orange-100 via-rose-50 to-teal-100 text-6xl">
              {category.emoji}
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white">
                {category.emoji} {category.label}
              </span>
              {pixel.visited_at ? (
                <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-600">
                  {formatVisitedDate(pixel.visited_at)}
                </span>
              ) : null}
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-stone-900">
              {pixel.name}
            </h1>

            {pixel.place_name ? (
              <div className="mt-4 flex items-start gap-3 rounded-2xl bg-orange-50 p-4">
                <span className="text-lg" aria-hidden>📍</span>
                <div>
                  <p className="font-semibold text-stone-800">
                    {pixel.place_name}
                  </p>
                  {address ? (
                    <p className="mt-1 text-xs leading-5 text-stone-500">
                      {address}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            <p className="mt-6 whitespace-pre-wrap text-[15px] leading-7 text-stone-700">
              {pixel.description || "이 추억에는 아직 설명이 없습니다."}
            </p>
          </div>
        </article>

        {hasLocation ? (
          <KakaoMap
            lat={pixel.lat as number}
            lng={pixel.lng as number}
            placeName={pixel.place_name || pixel.name}
            placeUrl={pixel.place_url}
          />
        ) : null}

        <div className="mt-6 rounded-2xl border border-white/70 bg-white/60 p-4 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
            Pixel UID
          </p>
          <p className="mt-2 break-all font-mono text-sm text-stone-600">
            {pixel.uid}
          </p>
        </div>
      </main>

      {showDeleteConfirm ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center">
          <section className="w-full max-w-sm rounded-[1.75rem] border border-white/80 bg-white p-5 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-xl" aria-hidden>
              🗑️
            </div>
            <h2 className="mt-4 text-xl font-black tracking-tight text-stone-900">
              이 추억을 삭제할까요?
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              삭제하면 피드와 꽃에서 사라지고 되돌릴 수 없습니다.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="rounded-2xl bg-stone-100 px-4 py-3 text-sm font-bold text-stone-700 disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {deleting ? "삭제 중..." : "완전히 삭제"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
