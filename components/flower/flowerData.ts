export type PixelState = "filled" | "empty";
export type MemoryCategory = "Food" | "Place" | "Memory";

export type MemoryData = {
  title: string;
  category: MemoryCategory;
  description: string;
  location: string;
};

export type FlowerPixelRegion = "petal" | "center-ring" | "center-hole";

export type FlowerPixel = {
  id: number;
  row: number;
  col: number;
  petalIndex: number;
  region: FlowerPixelRegion;
  state: PixelState;
  guideColor: string;
  filledColor: string;
  uid?: string;
  memory?: MemoryData;
};

export const FLOWER_GRID_SIZE = 25;
export const FLOWER_PETAL_COUNT = 8;

type PetalPalette = {
  guide: string;
  filled: string;
  glow: string;
};

/**
 * 한 송이 안에서 색이 자연스럽게 이어지도록
 * 살구 → 장미 → 라일락 → 푸른 보라 → 민트 순서로 구성한다.
 */
export const PETAL_PALETTES: PetalPalette[] = [
  { guide: "#FBE2D4", filled: "#F17A78", glow: "rgba(241, 122, 120, 0.26)" },
  { guide: "#F9D7E3", filled: "#E55F8F", glow: "rgba(229, 95, 143, 0.24)" },
  { guide: "#F0DEF4", filled: "#B66CC4", glow: "rgba(182, 108, 196, 0.22)" },
  { guide: "#E4E2F8", filled: "#8178D8", glow: "rgba(129, 120, 216, 0.22)" },
  { guide: "#DDEAF7", filled: "#5D8CCF", glow: "rgba(93, 140, 207, 0.22)" },
  { guide: "#DDF1EC", filled: "#42A88F", glow: "rgba(66, 168, 143, 0.22)" },
  { guide: "#E7F0D6", filled: "#85AA56", glow: "rgba(133, 170, 86, 0.22)" },
  { guide: "#FAE8C9", filled: "#E6A14A", glow: "rgba(230, 161, 74, 0.24)" },
];

export const PETAL_GLOWS = PETAL_PALETTES.map((palette) => palette.glow);

const CENTER_RING_INNER = "#F7B844";
const CENTER_RING_OUTER = "#D88222";
const CENTER_HOLE_COLOR = "#FFF8D9";
const CENTER = (FLOWER_GRID_SIZE - 1) / 2;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function mixHex(from: string, to: string, amount: number) {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const ratio = clamp(amount, 0, 1);
  const channel = (start: number, end: number) =>
    Math.round(start + (end - start) * ratio)
      .toString(16)
      .padStart(2, "0");

  return `#${channel(a.r, b.r)}${channel(a.g, b.g)}${channel(a.b, b.b)}`;
}

function getDistance(row: number, col: number) {
  return Math.hypot(col - CENTER, row - CENTER);
}

function getAngle(row: number, col: number) {
  return Math.atan2(row - CENTER, col - CENTER);
}

/**
 * 둥근 8엽 꽃 실루엣.
 * 꽃잎 끝은 충분히 풍성하게, 꽃잎 사이 골은 너무 날카롭지 않게 만든다.
 */
function isInsideFlower(row: number, col: number) {
  const distance = getDistance(row, col);
  const angle = getAngle(row, col);
  const wave = (1 + Math.cos(FLOWER_PETAL_COUNT * (angle + Math.PI / 2))) / 2;
  const maxRadius = 6.3 + 2.8 * Math.pow(wave, 1.35);

  return distance <= maxRadius;
}

function getPetalIndex(row: number, col: number) {
  const angle = getAngle(row, col);
  const normalized = (angle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);

  return (
    Math.round(normalized / ((Math.PI * 2) / FLOWER_PETAL_COUNT)) %
    FLOWER_PETAL_COUNT
  );
}

function getRegion(row: number, col: number): FlowerPixelRegion {
  const distance = getDistance(row, col);

  if (distance <= 2.05) return "center-hole";
  if (distance <= 4.5) return "center-ring";
  return "petal";
}

function buildFlowerPixels(): FlowerPixel[] {
  const pixels: FlowerPixel[] = [];
  let id = 0;

  for (let row = 0; row < FLOWER_GRID_SIZE; row += 1) {
    for (let col = 0; col < FLOWER_GRID_SIZE; col += 1) {
      if (!isInsideFlower(row, col)) continue;

      const region = getRegion(row, col);
      const petalIndex = getPetalIndex(row, col);
      const distance = getDistance(row, col);
      const palette = PETAL_PALETTES[petalIndex];
      const texture = ((row * 7 + col * 11) % 5) / 100;

      if (region === "center-hole") {
        pixels.push({
          id: id++,
          row,
          col,
          petalIndex,
          region,
          state: "filled",
          guideColor: CENTER_HOLE_COLOR,
          filledColor: CENTER_HOLE_COLOR,
        });
        continue;
      }

      if (region === "center-ring") {
        const ringRatio = clamp((distance - 2.05) / 2.45, 0, 1);
        const color = mixHex(CENTER_RING_INNER, CENTER_RING_OUTER, ringRatio * 0.8 + texture);

        pixels.push({
          id: id++,
          row,
          col,
          petalIndex,
          region,
          state: "filled",
          guideColor: color,
          filledColor: color,
        });
        continue;
      }

      const distanceRatio = clamp((distance - 4.5) / 4.6, 0, 1);
      const guideColor = mixHex(
        palette.guide,
        "#FFFFFF",
        0.08 + (1 - distanceRatio) * 0.16 + texture,
      );
      const filledColor = mixHex(
        palette.filled,
        distanceRatio > 0.58 ? "#7E3C4C" : "#FFFFFF",
        distanceRatio > 0.58 ? 0.08 + texture : 0.08 + texture,
      );

      pixels.push({
        id: id++,
        row,
        col,
        petalIndex,
        region,
        state: "empty",
        guideColor,
        filledColor,
      });
    }
  }

  return pixels;
}

export const FLOWER_PIXELS = buildFlowerPixels();
export const FLOWER_MEMORY_SLOTS = FLOWER_PIXELS.filter(
  (pixel) => pixel.region === "petal",
);

/**
 * 추억이 한 꽃잎에 몰리지 않도록 8개 꽃잎을 번갈아 채운다.
 * 같은 꽃잎 안에서는 중심에 가까운 픽셀부터 밖으로 퍼져나간다.
 */
const slotsByPetal = PETAL_PALETTES.map((_, petalIndex) =>
  FLOWER_MEMORY_SLOTS.filter((pixel) => pixel.petalIndex === petalIndex).sort(
    (a, b) => getDistance(a.row, a.col) - getDistance(b.row, b.col),
  ),
);

export const ORDERED_FLOWER_MEMORY_SLOTS: FlowerPixel[] = [];
let slotIndex = 0;

while (true) {
  let added = false;

  for (let petalIndex = 0; petalIndex < slotsByPetal.length; petalIndex += 1) {
    const slot = slotsByPetal[petalIndex][slotIndex];
    if (!slot) continue;

    ORDERED_FLOWER_MEMORY_SLOTS.push(slot);
    added = true;
  }

  if (!added) break;
  slotIndex += 1;
}

export const FLOWER_TOTAL_COUNT = FLOWER_MEMORY_SLOTS.length;
