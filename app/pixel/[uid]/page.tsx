"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getPixel } from "@/lib/pixel";
import { Pixel } from "@/types/pixel";

interface Props {
  params: Promise<{
    uid: string;
  }>;
}

export default function PixelPage({ params }: Props) {
  const router = useRouter();
  const [pixel, setPixel] = useState<Pixel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { uid } = await params;
      const data = await getPixel(uid);
      setPixel(data);
      setLoading(false);
    }

    load();
  }, [params]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-stone-500">
        불러오는 중...
      </main>
    );
  }

  if (!pixel) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p>Pixel을 찾을 수 없습니다.</p>
        <button onClick={() => router.push("/")} className="font-semibold">
          홈으로 돌아가기
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col p-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-5 w-fit text-sm font-medium text-stone-500"
      >
        ← 돌아가기
      </button>

      <h1 className="text-3xl font-bold">{pixel.name}</h1>

      {pixel.image && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200">
          <Image
            src={pixel.image}
            alt={pixel.name}
            width={600}
            height={400}
            className="h-72 w-full object-cover"
            unoptimized
          />
        </div>
      )}

      {pixel.visited_at && (
        <p className="mt-4 text-sm text-stone-500">📅 {pixel.visited_at}</p>
      )}

      <p className="mt-4 whitespace-pre-wrap leading-7 text-stone-700">
        {pixel.description || "아직 설명이 없습니다."}
      </p>

      <div className="mt-8 rounded-xl border border-stone-200 bg-white p-4">
        <p className="font-semibold">UID</p>
        <p className="mt-1 break-all text-sm text-stone-500">{pixel.uid}</p>
      </div>
    </main>
  );
}
