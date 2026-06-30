export interface Pixel {
    id: string;
    uid: string;
    name: string;
    description: string | null;
    image: string | null;
    lat: number | null;
    lng: number | null;
    created_at: string;
  }