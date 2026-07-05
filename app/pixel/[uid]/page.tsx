"use client";

import { useEffect, useState } from "react";
import Image from "next/image"; 
import { getPixel } from "@/lib/pixel";
import { Pixel } from "@/types/pixel";

interface Props {
  params: Promise<{
    uid: string;
  }>;
}

export default function PixelPage({ params }: Props) {
  const [pixel, setPixel] = useState<Pixel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const resolvedParams = await params; // ⭐ 핵심

      const data = await getPixel(resolvedParams.uid);

      setPixel(data);
      setLoading(false);
    }

    load();
  }, [params]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Loading...
      </main>
    );
  }

  if (!pixel) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Pixel을 찾을 수 없습니다.
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col p-6">
      <h1 className="text-3xl font-bold">{pixel.name}</h1>
      {pixel.image && (
  <div className="mt-6 overflow-hidden rounded-2xl border">
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
      <p className="mt-4 text-stone-600">{pixel.description}</p>

      <div className="mt-8 rounded-xl border p-4">
        <p className="font-semibold">UID</p>
        <p>{pixel.uid}</p>
      </div>
    </main>
  );
}