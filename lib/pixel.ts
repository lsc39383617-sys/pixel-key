import { supabase } from "./supabase";
import { Pixel } from "@/types/pixel";

export async function getPixels(): Promise<Pixel[]> {
  const { data, error } = await supabase
    .from("pixels")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPixels error:", error);
    return [];
  }

  return data as Pixel[];
}

export async function getPixel(uid: string): Promise<Pixel | null> {
  const { data, error } = await supabase
    .from("pixels")
    .select("*")
    .eq("uid", uid)
    .maybeSingle();

  if (error) {
    console.error("getPixel error:", error);
    return null;
  }

  return data as Pixel | null;
}

export async function createPixel(
  name: string,
  description: string,
  image: string,
  visitedAt: string,
): Promise<Pixel> {
  const uid = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

  const { data, error } = await supabase
    .from("pixels")
    .insert({
      uid,
      name: name.trim(),
      description: description.trim(),
      image: image || null,
      visited_at: visitedAt || null,
    })
    .select()
    .single();

  if (error) {
    console.error("createPixel error:", error);
    throw error;
  }

  return data as Pixel;
}

export async function uploadImage(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "png";
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
    throw error;
  }

  const { data } = supabase.storage
    .from("pixel-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}
