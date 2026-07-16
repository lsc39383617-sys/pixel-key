"use client";

import { useEffect, useRef, useState } from "react";
import { loadKakaoMaps } from "@/lib/kakao-map";

type KakaoMapProps = {
  lat: number;
  lng: number;
  placeName: string;
  placeUrl?: string | null;
};

export function KakaoMap({ lat, lng, placeName, placeUrl }: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function renderMap() {
      try {
        const kakao = await loadKakaoMaps();
        if (cancelled || !containerRef.current) return;

        const position = new kakao.maps.LatLng(lat, lng);
        const map = new kakao.maps.Map(containerRef.current, {
          center: position,
          level: 3,
        });
        new kakao.maps.Marker({ position, map });
      } catch (mapError) {
        setError(
          mapError instanceof Error
            ? mapError.message
            : "카카오맵을 불러오지 못했습니다.",
        );
      }
    }

    renderMap();

    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  const fallbackUrl = `https://map.kakao.com/?q=${encodeURIComponent(placeName)}`;

  return (
    <section className="mt-7 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
            Location
          </p>
          <h2 className="mt-1 truncate font-semibold text-stone-900">{placeName}</h2>
        </div>
        <a
          href={placeUrl || fallbackUrl}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-xl bg-stone-900 px-3 py-2 text-xs font-semibold text-white"
        >
          카카오맵 열기
        </a>
      </div>

      <div className="relative h-72 bg-stone-100">
        <div ref={containerRef} className="h-full w-full" aria-label={`${placeName} 지도`} />
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-100 px-6 text-center text-sm text-stone-500">
            {error}
          </div>
        ) : null}
      </div>
    </section>
  );
}
