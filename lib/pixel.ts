import type { CreatePixelInput, Pixel } from "@/types/pixel";

function formatSupabaseError(error: {
  message?: string;
  code?: string;
  details?: string | null;
  hint?: string | null;
}) {
  return [error.message, error.details, error.hint].filter(Boolean).join(" / ");
}

function isMissingMapColumn(error: { message?: string; code?: string }) {
  const message = error.message?.toLowerCase() ?? "";
  return (
    error.code === "PGRST204" ||
    message.includes("place_name") ||
    message.includes("address_name") ||
    message.includes("road_address_name") ||
    message.includes("place_url") ||
    message.includes("category") ||
    message.includes("lat") ||
    message.includes("lng")
  );
}

function cleanEnvironmentValue(value: string | undefined) {
  let cleaned = value?.trim() ?? "";

  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  return cleaned;
}

function getDirectSupabaseConfig() {
  const url = cleanEnvironmentValue(process.env.NEXT_PUBLIC_SUPABASE_URL).replace(
    /\/+$/,
    "",
  );
  const anonKey = cleanEnvironmentValue(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) {
    throw new Error(
      "Supabase URL 설정이 올바르지 않습니다. Vercel의 NEXT_PUBLIC_SUPABASE_URL 값을 다시 확인해주세요.",
    );
  }

  // HTTP 헤더는 한글·이모지 같은 문자를 허용하지 않습니다. 키를 붙여넣을 때
  // 설명문이나 줄바꿈이 같이 들어간 경우, 브라우저가 요청 자체를 만들지 못합니다.
  if (!anonKey || !/^[A-Za-z0-9._~-]+$/.test(anonKey)) {
    throw new Error(
      "Supabase ANON KEY에 잘못된 문자나 줄바꿈이 포함돼 있습니다. Vercel의 NEXT_PUBLIC_SUPABASE_ANON_KEY에는 키 값만 다시 붙여넣어주세요.",
    );
  }

  return { url, anonKey };
}

async function readApiError(response: Response) {
  const text = await response.text();

  if (!text) {
    return {
      message: `${response.status} ${response.statusText}`,
      code: String(response.status),
    };
  }

  try {
    const parsed = JSON.parse(text) as {
      message?: string;
      error?: string;
      code?: string;
      details?: string | null;
      hint?: string | null;
    };

    return {
      message: parsed.message || parsed.error || text,
      code: parsed.code || String(response.status),
      details: parsed.details,
      hint: parsed.hint,
    };
  } catch {
    return {
      message: text,
      code: String(response.status),
    };
  }
}

function createReadHeaders(anonKey: string): HeadersInit {
  return {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    Accept: "application/json",
  };
}

export async function getPixels(): Promise<Pixel[]> {
  const { url, anonKey } = getDirectSupabaseConfig();
  const endpoint = new URL(`${url}/rest/v1/pixels`);
  endpoint.searchParams.set("select", "*");
  endpoint.searchParams.set("order", "created_at.desc");

  let response: Response;

  try {
    response = await fetch(endpoint.toString(), {
      method: "GET",
      headers: createReadHeaders(anonKey),
      cache: "no-store",
    });
  } catch (error) {
    console.error("getPixels request error:", error);
    throw new Error(
      `Pixel 목록 요청을 만들지 못했습니다: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`,
    );
  }

  if (!response.ok) {
    const apiError = await readApiError(response);
    console.error("getPixels API error:", apiError);
    throw new Error(`Pixel 목록을 불러오지 못했습니다: ${formatSupabaseError(apiError)}`);
  }

  return (await response.json()) as Pixel[];
}

export async function getPixel(uid: string): Promise<Pixel | null> {
  const { url, anonKey } = getDirectSupabaseConfig();
  const endpoint = new URL(`${url}/rest/v1/pixels`);
  endpoint.searchParams.set("select", "*");
  endpoint.searchParams.set("uid", `eq.${uid}`);
  endpoint.searchParams.set("limit", "1");

  let response: Response;

  try {
    response = await fetch(endpoint.toString(), {
      method: "GET",
      headers: createReadHeaders(anonKey),
      cache: "no-store",
    });
  } catch (error) {
    console.error("getPixel request error:", error);
    throw new Error(
      `Pixel 조회 요청을 만들지 못했습니다: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`,
    );
  }

  if (!response.ok) {
    const apiError = await readApiError(response);
    console.error("getPixel API error:", apiError);
    throw new Error(`Pixel을 불러오지 못했습니다: ${formatSupabaseError(apiError)}`);
  }

  const data = (await response.json()) as Pixel[];
  return data[0] ?? null;
}

export async function createPixel(input: CreatePixelInput): Promise<Pixel> {
  const { url, anonKey } = getDirectSupabaseConfig();
  const uid = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  const place = input.place;

  const payload = {
    uid,
    name: input.name.trim(),
    description: input.description.trim(),
    image: input.image || null,
    visited_at: input.visitedAt || null,
    category: input.category,
    place_name: place?.placeName || null,
    address_name: place?.addressName || null,
    road_address_name: place?.roadAddressName || null,
    place_url: place?.placeUrl || null,
    lat: place?.lat ?? null,
    lng: place?.lng ?? null,
  };

  let response: Response;

  try {
    response = await fetch(`${url}/rest/v1/pixels`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("createPixel request error:", error);
    throw new Error(
      `저장 요청을 만들지 못했습니다: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`,
    );
  }

  if (!response.ok) {
    const apiError = await readApiError(response);
    console.error("createPixel API error:", apiError);

    if (isMissingMapColumn(apiError)) {
      throw new Error(
        "Supabase DB에 지도 저장용 컬럼이 아직 없습니다. RUN-THIS-IN-SUPABASE.sql을 Supabase SQL Editor에서 실행한 뒤 다시 저장해주세요.",
      );
    }

    if (apiError.code === "42501" || response.status === 401 || response.status === 403) {
      throw new Error(
        "Supabase 저장 권한 또는 API 키 설정이 올바르지 않습니다. RLS 정책과 Vercel의 Supabase 환경변수를 확인해주세요.",
      );
    }

    throw new Error(`저장에 실패했습니다: ${formatSupabaseError(apiError)}`);
  }

  const data = (await response.json()) as Pixel[] | Pixel;
  const pixel = Array.isArray(data) ? data[0] : data;

  if (!pixel) {
    throw new Error("저장은 완료됐지만 생성된 Pixel 정보를 받지 못했습니다.");
  }

  return pixel;
}

const IMAGE_MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  heic: "image/heic",
  heif: "image/heif",
};

function getSafeImageUploadInfo(file: File) {
  const rawExtension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const extension = /^[a-z0-9]{2,5}$/.test(rawExtension)
    ? rawExtension
    : "jpg";

  const rawMimeType = file.type.trim().toLowerCase();
  const contentType = /^image\/[a-z0-9.+-]+$/i.test(rawMimeType)
    ? rawMimeType
    : IMAGE_MIME_BY_EXTENSION[extension] ?? "application/octet-stream";

  return { extension, contentType };
}

function encodeStoragePath(path: string) {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export async function uploadImage(file: File): Promise<string> {
  const { url, anonKey } = getDirectSupabaseConfig();
  const { extension, contentType } = getSafeImageUploadInfo(file);
  const fileName = `pixels/${crypto.randomUUID()}.${extension}`;
  const encodedPath = encodeStoragePath(fileName);
  const fileBuffer = await file.arrayBuffer();

  let response: Response;

  try {
    // Supabase SDK 내부에서 동적으로 생성되는 헤더를 완전히 우회하고,
    // ASCII로 검증한 헤더만 직접 전송합니다. 사진명은 요청 헤더에 넣지 않습니다.
    response = await fetch(
      `${url}/storage/v1/object/pixel-images/${encodedPath}`,
      {
        method: "POST",
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
          "Content-Type": contentType,
          "Cache-Control": "max-age=3600",
          "x-upsert": "false",
        },
        body: fileBuffer,
      },
    );
  } catch (error) {
    console.error("uploadImage request error:", error);
    throw new Error(
      `사진 업로드 요청을 만들지 못했습니다: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`,
    );
  }

  if (!response.ok) {
    const apiError = await readApiError(response);
    console.error("uploadImage API error:", apiError);

    const lowerMessage = apiError.message?.toLowerCase() ?? "";
    if (lowerMessage.includes("bucket") || response.status === 404) {
      throw new Error(
        "사진 저장소가 아직 준비되지 않았습니다. RUN-THIS-IN-SUPABASE.sql을 실행해주세요.",
      );
    }

    if (apiError.code === "42501" || response.status === 401 || response.status === 403) {
      throw new Error(
        "사진 업로드 권한 또는 Supabase API 키 설정이 올바르지 않습니다. Storage 정책과 Vercel 환경변수를 확인해주세요.",
      );
    }

    throw new Error(`사진 업로드에 실패했습니다: ${formatSupabaseError(apiError)}`);
  }

  return `${url}/storage/v1/object/public/pixel-images/${encodedPath}`;
}
