export const PIXEL_CATEGORIES = [
  "food",
  "cafe",
  "travel",
  "date",
  "daily",
  "other",
] as const;

export type PixelCategory = (typeof PIXEL_CATEGORIES)[number];

export interface Pixel {
  id?: string;
  uid: string;
  name: string;
  description: string;
  image: string | null;
  visited_at: string | null;
  category: PixelCategory;
  place_name: string | null;
  address_name: string | null;
  road_address_name: string | null;
  place_url: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export interface PlaceSelection {
  placeName: string;
  addressName: string;
  roadAddressName: string;
  placeUrl: string;
  lat: number | null;
  lng: number | null;
}

export interface CreatePixelInput {
  name: string;
  description: string;
  image: string;
  visitedAt: string;
  category: PixelCategory;
  place: PlaceSelection | null;
}
