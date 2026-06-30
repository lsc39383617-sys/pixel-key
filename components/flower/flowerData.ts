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
};

const PASTEL_PALETTE = [
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
  "#C7CEEA",
  "#FF9AA2",
  "#E2F0CB",
  "#D4A5A5",
  "#FDFD96",
  "#FFEAA7",
] as const;

const CENTER_YELLOW = "#FFE066";

/** Precomputed layout — avoids cross-environment floating-point hydration mismatches. */
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

const SAMPLE_MEMORIES: MemoryData[] = [
  {
    title: "Morning Croissant",
    category: "Food",
    description:
      "Buttery, flaky perfection from the corner bakery on a slow Sunday morning.",
    location: "Le Petit Four, Paris",
  },
  {
    title: "Cherry Blossom Walk",
    category: "Place",
    description:
      "Pink petals drifting like snow along the river — the softest spring afternoon.",
    location: "Meguro River, Tokyo",
  },
  {
    title: "First Concert Together",
    category: "Memory",
    description:
      "Dancing under string lights as our favorite song played for the encore.",
    location: "Brooklyn Mirage, NYC",
  },
  {
    title: "Ramen at Midnight",
    category: "Food",
    description:
      "Rich tonkotsu broth, perfect noodles, and the steam fogging up the window.",
    location: "Ichiran, Shibuya",
  },
  {
    title: "Cliffside Sunset",
    category: "Place",
    description:
      "Golden light spilling over white-washed villages and the endless Aegean blue.",
    location: "Oia, Santorini",
  },
  {
    title: "Birthday Surprise",
    category: "Memory",
    description:
      "Friends hiding behind the couch, confetti cannon ready — pure joy.",
    location: "Home, Seoul",
  },
  {
    title: "Matcha Latte Art",
    category: "Food",
    description:
      "Ceremonial grade whisked to a jade froth with the cutest leaf pattern.",
    location: "Higashiya, Kyoto",
  },
  {
    title: "Hidden Bookshop",
    category: "Place",
    description:
      "Dusty shelves, creaky floorboards, and a cat napping on poetry collections.",
    location: "Shakespeare and Company",
  },
  {
    title: "Road Trip Playlist",
    category: "Memory",
    description:
      "Windows down, volume up, singing off-key through the mountain pass.",
    location: "Pacific Coast Highway",
  },
  {
    title: "Street Tacos",
    category: "Food",
    description:
      "Al pastor with pineapple, lime squeezed tight, salsa verde dripping down.",
    location: "El Vilsito, CDMX",
  },
  {
    title: "Lavender Fields",
    category: "Place",
    description:
      "Purple rows stretching to the horizon, buzzing bees, and honey-sweet air.",
    location: "Provence, France",
  },
  {
    title: "Graduation Day",
    category: "Memory",
    description:
      "Cap tossed high, tears of pride, and a photo that still makes us smile.",
    location: "Stanford University",
  },
  {
    title: "Dim Sum Brunch",
    category: "Food",
    description:
      "Steaming baskets of har gow and char siu bao shared family-style.",
    location: "Tim Ho Wan, Hong Kong",
  },
  {
    title: "Northern Lights",
    category: "Place",
    description:
      "Emerald ribbons dancing across an ink-black Arctic sky — utterly silent.",
    location: "Tromsø, Norway",
  },
  {
    title: "First Apartment",
    category: "Memory",
    description:
      "Paint-splattered floors, mismatched furniture, and dreams on every wall.",
    location: "Williamsburg, Brooklyn",
  },
  {
    title: "Gelato by the Duomo",
    category: "Food",
    description:
      "Pistachio and stracciatella melting fast in the warm Italian sun.",
    location: "Florence, Italy",
  },
  {
    title: "Rainforest Canopy",
    category: "Place",
    description:
      "Mist rising through ancient trees, toucans calling, the world felt brand new.",
    location: "Monteverde, Costa Rica",
  },
  {
    title: "New Year's Kiss",
    category: "Memory",
    description:
      "Fireworks bursting over the harbor as the clock struck twelve.",
    location: "Sydney Harbour",
  },
];

function buildFlowerPixels(): FlowerPixel[] {
  const petalSlots: FlowerPixel[] = PIXEL_LAYOUT.filter(
    (slot) => slot.region === "petal",
  ).map((slot) => ({
    ...slot,
    state: "empty" as const,
  }));

  const centerPixels: FlowerPixel[] = PIXEL_LAYOUT.filter(
    (slot) => slot.region === "center",
  ).map((slot) => ({
    ...slot,
    state: "filled" as const,
    color: CENTER_YELLOW,
  }));

  const petalGroups: FlowerPixel[][] = [[], [], [], [], []];
  for (const slot of petalSlots) {
    petalGroups[slot.petalIndex ?? 0].push(slot);
  }

  let memoryIndex = 0;

  for (let round = 0; memoryIndex < SAMPLE_MEMORIES.length; round++) {
    for (let petal = 0; petal < 5 && memoryIndex < SAMPLE_MEMORIES.length; petal++) {
      const emptySlot = petalGroups[petal].find((s) => s.state === "empty");
      if (!emptySlot) continue;
      emptySlot.state = "filled";
      emptySlot.color = PASTEL_PALETTE[memoryIndex % PASTEL_PALETTE.length];
      emptySlot.memory = SAMPLE_MEMORIES[memoryIndex++];
    }
  }

  return [...centerPixels, ...petalSlots];
}

export const FLOWER_PIXELS = buildFlowerPixels();
export const FLOWER_CENTER_COLOR = CENTER_YELLOW;
export const FLOWER_FILLED_COUNT = FLOWER_PIXELS.filter(
  (p) => p.region === "petal" && p.state === "filled",
).length;
export const FLOWER_TOTAL_COUNT = FLOWER_PIXELS.filter(
  (p) => p.region === "petal",
).length;
