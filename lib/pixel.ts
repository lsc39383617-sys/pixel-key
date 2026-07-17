import { supabase } from "./supabase";
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

export async function getPixels(): Promise<Pixel[]> {
  const { data, error } = await supabase
    .from("pixels")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPixels error:", error);
    throw new Error(`Pixel 목록을 불러오지 못했습니다: ${formatSupabaseError(error)}`);
  }

  return (data ?? []) as Pixel[];
}

export async function getPixel(uid: string): Promise<Pixel | null> {
  const { data, error } = await supabase
    .from("pixels")
    .select("*")
    .eq("uid", uid)
    .maybeSingle();

  if (error) {
    console.error("getPixel error:", error);
    throw new Error(`Pixel을 불러오지 못했습니다: ${formatSupabaseError(error)}`);
  }

  return data as Pixel | null;
}

export async function createPixel(input: CreatePixelInput): Promise<Pixel> {
  const uid = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  const place = input.place;

  const { data, error } = await supabase
    .from("pixels")
    .insert({
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
    })
    .select()
    .single();

  if (error) {
    console.error("createPixel error:", error);

    if (isMissingMapColumn(error)) {
      throw new Error(
        "Supabase DB에 지도 저장용 컬럼이 아직 없습니다. 압축파일의 RUN-THIS-IN-SUPABASE.sql을 Supabase SQL Editor에서 실행한 뒤 다시 저장해주세요.",
      );
    }

    if (error.code === "42501") {
      throw new Error(
        "Supabase 저장 권한이 없습니다. RUN-THIS-IN-SUPABASE.sql을 실행해 RLS 정책을 적용해주세요.",
      );
    }

    throw new Error(`저장에 실패했습니다: ${formatSupabaseError(error)}`);
  }

  return data as Pixel;
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

export async function uploadImage(file: File): Promise<string> {
  const { extension, contentType } = getSafeImageUploadInfo(file);
  const fileName = `pixels/${crypto.randomUUID()}.${extension}`;

  try {
    // File 객체를 그대로 전달하면 브라우저가 원본 파일명이나 MIME 정보를
    // multipart 헤더에 넣을 수 있습니다. 한글 파일명 등 비 ASCII 문자가
    // 포함된 경우 Headers 생성 단계에서 업로드가 실패할 수 있으므로,
    // 바이너리(ArrayBuffer)와 안전한 ASCII MIME 값만 전송합니다.
    const fileBuffer = await file.arrayBuffer();

    const { error } = await supabase.storage
      .from("pixel-images")
      .upload(fileName, fileBuffer, {
        cacheControl: "3600",
        upsert: false,
        contentType,
      });

    if (error) {
      console.error("uploadImage error:", error);

      if (error.message.toLowerCase().includes("bucket")) {
        throw new Error(
          "사진 저장소가 아직 준비되지 않았습니다. RUN-THIS-IN-SUPABASE.sql을 실행해주세요.",
        );
      }

      throw new Error(`사진 업로드에 실패했습니다: ${formatSupabaseError(error)}`);
    }
  } catch (error) {
    console.error("uploadImage request error:", error);

    if (error instanceof Error && error.message.startsWith("사진")) {
      throw error;
    }

    throw new Error(
      `사진 업로드에 실패했습니다: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`,
    );
  }

  const { data } = supabase.storage
    .from("pixel-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}
