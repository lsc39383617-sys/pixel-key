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
    .maybeSingle(); // ⭐ 핵심 변경

  if (error) {
    console.error("getPixel error:", error);
    return null;
  }

  return data as Pixel | null;
}