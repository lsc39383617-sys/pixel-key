import type {
  CreatePixelInput,
  Pixel,
  UpdatePixelInput,
} from "@/types/pixel";

type ApiError = {
  message?: string;
  code?: string;
  details?: string | null;
  hint?: string | null;
};

function formatSupabaseError(error: ApiError) {
  return [error.message, error.details, error.hint].filter(Boolean).join(" / ");
}

function isMissingMapColumn(error: ApiError) {
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

  if (!anonKey || !/^[A-Za-z0-9._~-]+$/.test(anonKey)) {
    throw new Error(
      "Supabase ANON KEY에 잘못된 문자나 줄바꿈이 포함돼 있습니다. Vercel 환경변수에는 키 값만 넣어주세요.",
    );
  }

  return { url, anonKey };
}

async function readApiError(response: Response): Promise<ApiError> {
  const text = await response.text();

  if (!text) {
    return {
      message: `${response.status} ${response.statusText}`,
      code: String(response.status),
    };
  }

  try {
    const parsed = JSON.parse(text) as ApiError & { error?: string };
    return {
      message: parsed.message || parsed.error || text,
      code: parsed.code || String(response.status),
      details: parsed.details,
      hint: parsed.hint,
    };
  } catch {
    return { message: text, code: String(response.status) };
  }
}

function createHeaders(anonKey: string, includeJson = false): HeadersInit {
  return {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    Accept: "application/json",
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
  };
}

function createPixelPayload(input: CreatePixelInput | UpdatePixelInput) {
  const place = input.place;

  return {
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
}

function throwWriteError(
  response: Response,
  apiError: ApiError,
  fallbackMessage: string,
): never {
  if (isMissingMapColumn(apiError)) {
    throw new Error(
      "Supabase DB에 필요한 컬럼이 없습니다. 프로젝트의 SQL 파일을 Supabase SQL Editor에서 실행해주세요.",
    );
  }

  if (
    apiError.code === "42501" ||
    response.status === 401 ||
    response.status === 403
  ) {
    throw new Error(
      "수정·삭제 권한이 없습니다. EDIT-DELETE-SUPABASE.sql을 Supabase SQL Editor에서 실행해주세요.",
    );
  }

  throw new Error(`${fallbackMessage}: ${formatSupabaseError(apiError)}`);
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
      headers: createHeaders(anonKey),
      cache: "no-store",
    });
  } catch (error) {
    throw new Error(
      `Pixel 목록 요청을 만들지 못했습니다: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`,
    );
  }

  if (!response.ok) {
    const apiError = await readApiError(response);
    throw new Error(
      `Pixel 목록을 불러오지 못했습니다: ${formatSupabaseError(apiError)}`,
    );
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
      headers: createHeaders(anonKey),
      cache: "no-store",
    });
  } catch (error) {
    throw new Error(
      `Pixel 조회 요청을 만들지 못했습니다: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`,
    );
  }

  if (!response.ok) {
    const apiError = await readApiError(response);
    throw new Error(
      `Pixel을 불러오지 못했습니다: ${formatSupabaseError(apiError)}`,
    );
  }

  const data = (await response.json()) as Pixel[];
  return data[0] ?? null;
}

export async function createPixel(input: CreatePixelInput): Promise<Pixel> {
  const { url, anonKey } = getDirectSupabaseConfig();
  const uid = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  const payload = { uid, ...createPixelPayload(input) };

  let response: Response;

  try {
    response = await fetch(`${url}/rest/v1/pixels`, {
      method: "POST",
      headers: {
        ...createHeaders(anonKey, true),
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error(
      `저장 요청을 만들지 못했습니다: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`,
    );
  }

  if (!response.ok) {
    const apiError = await readApiError(response);
    throwWriteError(response, apiError, "저장에 실패했습니다");
  }

  const data = (await response.json()) as Pixel[] | Pixel;
  const pixel = Array.isArray(data) ? data[0] : data;
  if (!pixel) throw new Error("생성된 Pixel 정보를 받지 못했습니다.");
  return pixel;
}

export async function updatePixel(
  uid: string,
  input: UpdatePixelInput,
): Promise<Pixel> {
  const { url, anonKey } = getDirectSupabaseConfig();
  const endpoint = new URL(`${url}/rest/v1/pixels`);
  endpoint.searchParams.set("uid", `eq.${uid}`);

  let response: Response;

  try {
    response = await fetch(endpoint.toString(), {
      method: "PATCH",
      headers: {
        ...createHeaders(anonKey, true),
        Prefer: "return=representation",
      },
      body: JSON.stringify(createPixelPayload(input)),
    });
  } catch (error) {
    throw new Error(
      `수정 요청을 만들지 못했습니다: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`,
    );
  }

  if (!response.ok) {
    const apiError = await readApiError(response);
    throwWriteError(response, apiError, "수정에 실패했습니다");
  }

  const data = (await response.json()) as Pixel[];
  const pixel = data[0];
  if (!pixel) throw new Error("수정할 Pixel을 찾지 못했습니다.");
  return pixel;
}

export async function deletePixel(
  uid: string,
  imageUrl?: string | null,
): Promise<void> {
  const { url, anonKey } = getDirectSupabaseConfig();
  const endpoint = new URL(`${url}/rest/v1/pixels`);
  endpoint.searchParams.set("uid", `eq.${uid}`);

  let response: Response;

  try {
    response = await fetch(endpoint.toString(), {
      method: "DELETE",
      headers: {
        ...createHeaders(anonKey),
        Prefer: "return=minimal",
      },
    });
  } catch (error) {
    throw new Error(
      `삭제 요청을 만들지 못했습니다: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`,
    );
  }

  if (!response.ok) {
    const apiError = await readApiError(response);
    throwWriteError(response, apiError, "삭제에 실패했습니다");
  }

  if (imageUrl) {
    await deleteImage(imageUrl).catch((error) => {
      console.warn("Pixel은 삭제했지만 이미지 정리에 실패했습니다.", error);
    });
  }
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

function getStoragePathFromPublicUrl(imageUrl: string) {
  try {
    const parsed = new URL(imageUrl);
    const marker = "/storage/v1/object/public/pixel-images/";
    const index = parsed.pathname.indexOf(marker);
    if (index < 0) return null;
    return decodeURIComponent(parsed.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
}

export async function uploadImage(file: File): Promise<string> {
  const { url, anonKey } = getDirectSupabaseConfig();
  const { extension, contentType } = getSafeImageUploadInfo(file);
  const fileName = `pixels/${crypto.randomUUID()}.${extension}`;
  const encodedPath = encodeStoragePath(fileName);
  const fileBuffer = await file.arrayBuffer();

  let response: Response;

  try {
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
    throw new Error(
      `사진 업로드 요청을 만들지 못했습니다: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`,
    );
  }

  if (!response.ok) {
    const apiError = await readApiError(response);
    const lowerMessage = apiError.message?.toLowerCase() ?? "";

    if (lowerMessage.includes("bucket") || response.status === 404) {
      throw new Error("사진 저장소가 준비되지 않았습니다.");
    }

    if (
      apiError.code === "42501" ||
      response.status === 401 ||
      response.status === 403
    ) {
      throw new Error("사진 업로드 권한이 없습니다.");
    }

    throw new Error(
      `사진 업로드에 실패했습니다: ${formatSupabaseError(apiError)}`,
    );
  }

  return `${url}/storage/v1/object/public/pixel-images/${encodedPath}`;
}

export async function deleteImage(imageUrl: string): Promise<void> {
  const path = getStoragePathFromPublicUrl(imageUrl);
  if (!path) return;

  const { url, anonKey } = getDirectSupabaseConfig();
  const response = await fetch(
    `${url}/storage/v1/object/pixel-images/${encodeStoragePath(path)}`,
    {
      method: "DELETE",
      headers: createHeaders(anonKey),
    },
  );

  if (!response.ok && response.status !== 404) {
    const apiError = await readApiError(response);
    throw new Error(
      `사진 삭제에 실패했습니다: ${formatSupabaseError(apiError)}`,
    );
  }
}
