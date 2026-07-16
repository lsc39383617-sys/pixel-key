import { supabase } from "./supabase";
import type { CreatePixelInput, Pixel } from "@/types/pixel";

export async function getPixels(): Promise<Pixel[]> {
  const { data, error } = await supabase
    .from("pixels")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPixels error:", error);
    throw new Error(`Pixel 목록을 불러오지 못했습니다: ${error.message}`);
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
    throw new Error(`Pixel을 불러오지 못했습니다: ${error.message}`);
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
    throw new Error(`저장에 실패했습니다: ${error.message}`);
  }

  return data as Pixel;
}

export async function uploadImage(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `pixels/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("pixel-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  if (error) {
    console.error("uploadImage error:", error);
    throw new Error(`사진 업로드에 실패했습니다: ${error.message}`);
  }

  const { data } = supabase.storage
    .from("pixel-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}
