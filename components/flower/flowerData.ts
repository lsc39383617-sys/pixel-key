export type PixelState = "filled" | "empty";
export type MemoryCategory = "Food" | "Place" | "Memory";

export type MemoryData = {
  title: string;
  category: MemoryCategory;
  description: string;
  location: string;
};

export type FlowerPixel = {
  id: number;
  x: number;
  y: number;
  region: "center" | "petal";
  petalIndex?: number;
  state: PixelState;
  color?: string;
  memory?: MemoryData;
  uid?: string;
};

export const FLOWER_PALETTE = [
  "#FFB5BA",
  "#FFCBA4",
  "#B8E0D2",
  "#AEC6CF",
  "#C3B1E1",
  "#FFD1DC",
  "#B5EAD7",
  "#FFDAC1",
  "#F7CAC9",
  "#92A8D1",
  "#9AD0EC",
  "#FFB7B2",
] as const;

const CENTER_YELLOW = "#FFE066";

const PIXEL_LAYOUT: Array<{
  id: number;
  x: number;
  y: number;
  region: "center" | "petal";
  petalIndex?: number;
}> = [
  { id: 0, x: 50, y: 50, region: "center" },
  { id: 1, x: 44.94, y: 50, region: "center" },
  { id: 2, x: 55.06, y: 50, region: "center" },
  { id: 3, x: 50, y: 44.94, region: "center" },
  { id: 4, x: 50, y: 55.06, region: "center" },
  { id: 5, x: 44.94, y: 44.94, region: "center" },
  { id: 6, x: 55.06, y: 44.94, region: "center" },
  { id: 7, x: 44.94, y: 55.06, region: "center" },
  { id: 8, x: 55.06, y: 55.06, region: "center" },
  { id: 9, x: 22.86, y: 50, region: "petal", petalIndex: 0 },
  { id: 10, x: 27.46, y: 56.44, region: "petal", petalIndex: 0 },
  { id: 11, x: 27.46, y: 43.56, region: "petal", petalIndex: 0 },
  { id: 12, x: 33.9, y: 61.04, region: "petal", petalIndex: 0 },
  { id: 13, x: 33.9, y: 50, region: "petal", petalIndex: 0 },
  { id: 14, x: 33.9, y: 38.96, region: "petal", petalIndex: 0 },
  { id: 15, x: 42.18, y: 62.88, region: "petal", petalIndex: 0 },
  { id: 16, x: 42.18, y: 54.14, region: "petal", petalIndex: 0 },
  { id: 17, x: 42.18, y: 45.86, region: "petal", petalIndex: 0 },
  { id: 18, x: 42.18, y: 37.12, region: "petal", petalIndex: 0 },
  { id: 19, x: 50.92, y: 56.9, region: "petal", petalIndex: 0 },
  { id: 20, x: 50.92, y: 50, region: "petal", petalIndex: 0 },
  { id: 21, x: 50.92, y: 43.1, region: "petal", petalIndex: 0 },
  { id: 22, x: 41.63, y: 24.24, region: "petal", petalIndex: 1 },
  { id: 23, x: 36.94, y: 30.59, region: "petal", petalIndex: 1 },
  { id: 24, x: 49.17, y: 26.63, region: "petal", petalIndex: 1 },
  { id: 25, x: 34.54, y: 38.13, region: "petal", petalIndex: 1 },
  { id: 26, x: 45.03, y: 34.73, region: "petal", petalIndex: 1 },
  { id: 27, x: 55.52, y: 31.32, region: "petal", petalIndex: 1 },
  { id: 28, x: 35.28, y: 46.6, region: "petal", petalIndex: 1 },
  { id: 29, x: 43.65, y: 43.84, region: "petal", petalIndex: 1 },
  { id: 30, x: 51.47, y: 41.35, region: "petal", petalIndex: 1 },
  { id: 31, x: 59.84, y: 38.59, region: "petal", petalIndex: 1 },
  { id: 32, x: 43.74, y: 53.04, region: "petal", petalIndex: 1 },
  { id: 33, x: 50.28, y: 50.92, region: "petal", petalIndex: 1 },
  { id: 34, x: 56.81, y: 48.8, region: "petal", petalIndex: 1 },
  { id: 35, x: 71.9, y: 33.99, region: "petal", petalIndex: 2 },
  { id: 36, x: 64.44, y: 31.51, region: "petal", petalIndex: 2 },
  { id: 37, x: 71.99, y: 41.9, region: "petal", petalIndex: 2 },
  { id: 38, x: 56.53, y: 31.6, region: "petal", petalIndex: 2 },
  { id: 39, x: 62.97, y: 40.52, region: "petal", petalIndex: 2 },
  { id: 40, x: 69.5, y: 49.45, region: "petal", petalIndex: 2 },
  { id: 41, x: 48.71, y: 34.91, region: "petal", petalIndex: 2 },
  { id: 42, x: 53.86, y: 42, region: "petal", petalIndex: 2 },
  { id: 43, x: 58.74, y: 48.71, region: "petal", petalIndex: 2 },
  { id: 44, x: 63.89, y: 55.8, region: "petal", petalIndex: 2 },
  { id: 45, x: 45.22, y: 44.94, region: "petal", petalIndex: 2 },
  { id: 46, x: 49.26, y: 50.46, region: "petal", petalIndex: 2 },
  { id: 47, x: 53.31, y: 56.07, region: "petal", petalIndex: 2 },
  { id: 48, x: 71.9, y: 66.01, region: "petal", petalIndex: 3 },
  { id: 49, x: 71.99, y: 58.1, region: "petal", petalIndex: 3 },
  { id: 50, x: 64.44, y: 68.49, region: "petal", petalIndex: 3 },
  { id: 51, x: 69.5, y: 50.55, region: "petal", petalIndex: 3 },
  { id: 52, x: 62.97, y: 59.48, region: "petal", petalIndex: 3 },
  { id: 53, x: 56.53, y: 68.4, region: "petal", petalIndex: 3 },
  { id: 54, x: 63.89, y: 44.2, region: "petal", petalIndex: 3 },
  { id: 55, x: 58.74, y: 51.29, region: "petal", petalIndex: 3 },
  { id: 56, x: 53.86, y: 58, region: "petal", petalIndex: 3 },
  { id: 57, x: 48.71, y: 65.09, region: "petal", petalIndex: 3 },
  { id: 58, x: 53.31, y: 43.93, region: "petal", petalIndex: 3 },
  { id: 59, x: 49.26, y: 49.54, region: "petal", petalIndex: 3 },
  { id: 60, x: 45.22, y: 55.06, region: "petal", petalIndex: 3 },
  { id: 61, x: 41.63, y: 75.76, region: "petal", petalIndex: 4 },
  { id: 62, x: 49.17, y: 73.37, region: "petal", petalIndex: 4 },
  { id: 63, x: 36.94, y: 69.41, region: "petal", petalIndex: 4 },
  { id: 64, x: 55.52, y: 68.68, region: "petal", petalIndex: 4 },
  { id: 65, x: 45.03, y: 65.27, region: "petal", petalIndex: 4 },
  { id: 66, x: 34.54, y: 61.87, region: "petal", petalIndex: 4 },
  { id: 67, x: 59.84, y: 61.41, region: "petal", petalIndex: 4 },
  { id: 68, x: 51.47, y: 58.65, region: "petal", petalIndex: 4 },
  { id: 69, x: 43.65, y: 56.16, region: "petal", petalIndex: 4 },
  { id: 70, x: 35.28, y: 53.4, region: "petal", petalIndex: 4 },
  { id: 71, x: 56.81, y: 51.2, region: "petal", petalIndex: 4 },
  { id: 72, x: 50.28, y: 49.08, region: "petal", petalIndex: 4 },
];

export const FLOWER_PIXELS: FlowerPixel[] = PIXEL_LAYOUT.map((slot) => ({
  ...slot,
  state: slot.region === "center" ? "filled" : "empty",
  color: slot.region === "center" ? CENTER_YELLOW : undefined,
}));

export const FLOWER_CENTER_COLOR = CENTER_YELLOW;
export const FLOWER_TOTAL_COUNT = FLOWER_PIXELS.filter(
  (pixel) => pixel.region === "petal",
).length;
