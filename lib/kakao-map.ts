import type { KakaoGlobal } from "@/types/kakao";

const SCRIPT_ID = "pixel-key-kakao-map-sdk";
let loadingPromise: Promise<KakaoGlobal> | null = null;

function finishLoading(resolve: (kakao: KakaoGlobal) => void, reject: (error: Error) => void) {
  const kakao = window.kakao;

  if (!kakao?.maps) {
    reject(new Error("카카오맵 SDK를 불러오지 못했습니다."));
    return;
  }

  kakao.maps.load(() => resolve(kakao));
}

export function loadKakaoMaps(): Promise<KakaoGlobal> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("지도는 브라우저에서만 사용할 수 있습니다."));
  }

  if (window.kakao?.maps) {
    return new Promise((resolve) => {
      window.kakao?.maps.load(() => resolve(window.kakao as KakaoGlobal));
    });
  }

  if (loadingPromise) return loadingPromise;

  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY?.trim();

  if (!appKey) {
    return Promise.reject(
      new Error("NEXT_PUBLIC_KAKAO_MAP_KEY가 설정되지 않았습니다."),
    );
  }

  loadingPromise = new Promise<KakaoGlobal>((resolve, reject) => {
    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => finishLoading(resolve, reject), {
        once: true,
      });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("카카오맵 SDK 요청에 실패했습니다.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(
      appKey,
    )}&autoload=false&libraries=services`;
    script.onload = () => finishLoading(resolve, reject);
    script.onerror = () => reject(new Error("카카오맵 SDK 요청에 실패했습니다."));
    document.head.appendChild(script);
  }).catch((error) => {
    loadingPromise = null;
    throw error;
  });

  return loadingPromise;
}
