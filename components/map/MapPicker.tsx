"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { loadKakaoMaps } from "@/lib/kakao-map";
import type {
  KakaoGlobal,
  KakaoMapInstance,
  KakaoMarkerInstance,
  KakaoPlaceResult,
  KakaoPlacesService,
} from "@/types/kakao";
import type { PlaceSelection } from "@/types/pixel";

type MapPickerProps = {
  value: PlaceSelection | null;
  onChange: (place: PlaceSelection | null) => void;
};

const DEFAULT_CENTER = {
  lat: 35.1595454,
  lng: 126.8526012,
};

function placeResultToSelection(place: KakaoPlaceResult): PlaceSelection {
  return {
    placeName: place.place_name,
    addressName: place.address_name,
    roadAddressName: place.road_address_name,
    placeUrl: place.place_url,
    lat: Number(place.y),
    lng: Number(place.x),
  };
}

export function MapPicker({ value, onChange }: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const initialValueRef = useRef(value);
  const kakaoRef = useRef<KakaoGlobal | null>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const markerRef = useRef<KakaoMarkerInstance | null>(null);
  const placesRef = useRef<KakaoPlacesService | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<KakaoPlaceResult[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);

  const moveMarker = useCallback((lat: number, lng: number) => {
    const kakao = kakaoRef.current;
    const map = mapRef.current;

    if (!kakao || !map) return;

    const position = new kakao.maps.LatLng(lat, lng);
    map.panTo(position);
    map.setLevel(3);

    if (markerRef.current) {
      markerRef.current.setPosition(position);
      markerRef.current.setMap(map);
    } else {
      markerRef.current = new kakao.maps.Marker({ position, map });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        const kakao = await loadKakaoMaps();
        if (cancelled || !mapContainerRef.current) return;

        const initialValue = initialValueRef.current;
        const initialLat = initialValue?.lat ?? DEFAULT_CENTER.lat;
        const initialLng = initialValue?.lng ?? DEFAULT_CENTER.lng;
        const center = new kakao.maps.LatLng(initialLat, initialLng);
        const map = new kakao.maps.Map(mapContainerRef.current, {
          center,
          level:
            initialValue?.lat !== null && initialValue?.lng !== null ? 3 : 7,
        });

        kakaoRef.current = kakao;
        mapRef.current = map;
        placesRef.current = new kakao.maps.services.Places(map);

        if (initialValue?.lat !== null && initialValue?.lng !== null) {
          markerRef.current = new kakao.maps.Marker({ position: center, map });
        }

        setMapReady(true);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "지도를 불러오지 못했습니다.";
        setMapError(message);
      }
    }

    initialize();

    return () => {
      cancelled = true;
      markerRef.current?.setMap(null);
    };
  }, []);

  useEffect(() => {
    if (!value || !mapReady || value.lat === null || value.lng === null) return;
    moveMarker(value.lat, value.lng);
  }, [mapReady, moveMarker, value]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const keyword = query.trim();
    const kakao = kakaoRef.current;
    const places = placesRef.current;

    if (!keyword) {
      alert("검색할 장소를 입력해주세요.");
      return;
    }

    if (!kakao || !places) {
      alert(mapError || "지도가 아직 준비되지 않았습니다.");
      return;
    }

    setSearching(true);
    places.keywordSearch(
      keyword,
      (data, status) => {
        setSearching(false);

        if (status === kakao.maps.services.Status.OK) {
          setResults(data);
          if (data[0]) {
            const first = placeResultToSelection(data[0]);
            if (first.lat !== null && first.lng !== null) {
              moveMarker(first.lat, first.lng);
            }
          }
          return;
        }

        setResults([]);

        if (status === kakao.maps.services.Status.ZERO_RESULT) {
          alert("검색 결과가 없습니다. 장소명이나 지역명을 함께 입력해보세요.");
          return;
        }

        alert("장소 검색에 실패했습니다. 잠시 후 다시 시도해주세요.");
      },
      { size: 10 },
    );
  }

  function selectPlace(place: KakaoPlaceResult) {
    const selection = placeResultToSelection(place);
    onChange(selection);
    if (selection.lat !== null && selection.lng !== null) {
      moveMarker(selection.lat, selection.lng);
    }
    setQuery(selection.placeName);
    setResults([]);
  }


  function useTypedPlaceName() {
    const placeName = query.trim();

    if (!placeName) {
      alert("입력한 장소명이 없습니다.");
      return;
    }

    onChange({
      placeName,
      addressName: "",
      roadAddressName: "",
      placeUrl: "",
      lat: null,
      lng: null,
    });
    setResults([]);
  }

  function selectCurrentLocation() {
    if (!navigator.geolocation) {
      alert("이 브라우저는 현재 위치 기능을 지원하지 않습니다.");
      return;
    }

    const kakao = kakaoRef.current;
    if (!kakao) {
      alert(mapError || "지도가 아직 준비되지 않았습니다.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const lat = coords.latitude;
        const lng = coords.longitude;
        const geocoder = new kakao.maps.services.Geocoder();

        geocoder.coord2Address(lng, lat, (data, status) => {
          setLocating(false);

          const result = data[0];
          const roadAddress = result?.road_address?.address_name ?? "";
          const address = result?.address?.address_name ?? "";
          const label = roadAddress || address || "현재 위치";

          onChange({
            placeName: label,
            addressName: address,
            roadAddressName: roadAddress,
            placeUrl: "",
            lat,
            lng,
          });
          moveMarker(lat, lng);
          setQuery(label);
          setResults([]);

          if (status !== kakao.maps.services.Status.OK) {
            console.warn("현재 위치의 주소를 찾지 못했습니다.");
          }
        });
      },
      (error) => {
        setLocating(false);
        const messages: Record<number, string> = {
          1: "위치 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.",
          2: "현재 위치를 확인할 수 없습니다.",
          3: "현재 위치 확인 시간이 초과되었습니다.",
        };
        alert(messages[error.code] || "현재 위치를 가져오지 못했습니다.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-semibold text-stone-900">장소</h2>
          <p className="mt-1 text-xs leading-5 text-stone-500">
            카카오맵에서 장소를 검색해 추억과 위치를 연결하세요.
          </p>
        </div>
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              markerRef.current?.setMap(null);
              setQuery("");
              setResults([]);
            }}
            className="shrink-0 text-xs font-semibold text-rose-500"
          >
            장소 지우기
          </button>
        ) : null}
      </div>

      <form onSubmit={handleSearch} className="space-y-2">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="예: 광주 양림동 카페"
            className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
          />
          <button
            type="submit"
            disabled={!mapReady || searching}
            className="rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {searching ? "검색 중" : "검색"}
          </button>
        </div>

        <button
          type="button"
          onClick={useTypedPlaceName}
          disabled={!query.trim()}
          className="w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          입력한 장소명 그대로 사용
        </button>
      </form>

      {value ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-xs font-semibold text-emerald-700">선택된 장소</p>
          <p className="mt-1 font-semibold text-stone-900">{value.placeName}</p>
          {value.roadAddressName || value.addressName ? (
            <p className="mt-1 text-xs leading-5 text-stone-500">
              {value.roadAddressName || value.addressName}
            </p>
          ) : (
            <p className="mt-1 text-xs leading-5 text-stone-500">
              직접 입력한 장소명으로 저장됩니다.
            </p>
          )}
        </div>
      ) : null}

      <button
        type="button"
        onClick={selectCurrentLocation}
        disabled={!mapReady || locating}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition active:scale-[0.99] disabled:opacity-40"
      >
        <span aria-hidden>◎</span>
        {locating ? "현재 위치 확인 중..." : "현재 위치 사용"}
      </button>

      {results.length > 0 ? (
        <div className="max-h-72 overflow-y-auto rounded-2xl border border-stone-200 bg-white shadow-lg">
          {results.map((place) => (
            <button
              key={place.id}
              type="button"
              onClick={() => selectPlace(place)}
              className="block w-full border-b border-stone-100 px-4 py-3 text-left last:border-0 hover:bg-orange-50"
            >
              <strong className="block text-sm text-stone-900">{place.place_name}</strong>
              <span className="mt-1 block text-xs leading-5 text-stone-500">
                {place.road_address_name || place.address_name}
              </span>
              {place.category_name ? (
                <span className="mt-1 block truncate text-[11px] text-stone-400">
                  {place.category_name}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
        <div ref={mapContainerRef} className="h-72 w-full" aria-label="장소 선택 지도" />

        {!mapReady && !mapError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-100 text-sm text-stone-500">
            지도를 불러오는 중...
          </div>
        ) : null}

        {mapError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-100 px-6 text-center">
            <p className="text-sm font-semibold text-stone-700">카카오맵 설정이 필요합니다.</p>
            <p className="mt-2 text-xs leading-5 text-stone-500">{mapError}</p>
            <p className="mt-2 text-[11px] leading-5 text-stone-400">
              장소를 선택하지 않아도 Pixel 저장은 가능합니다.
            </p>
          </div>
        ) : null}
      </div>

      {value ? (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-lg" aria-hidden>
              📍
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-stone-900">{value.placeName}</p>
              <p className="mt-1 text-xs leading-5 text-stone-500">
                {value.roadAddressName || value.addressName || "주소 정보 없음"}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
