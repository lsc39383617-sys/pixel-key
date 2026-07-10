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

type PetalPalette = {
  guide: string;
  filled: string;
};

export const PETAL_PALETTES: PetalPalette[] = [
  {
    guide: "#FBE7C7",
    filled: "#F3A13B",
  },
  {
    guide: "#F8F0D7",
    filled: "#E8C46C",
  },
  {
    guide: "#FADDD4",
    filled: "#ED7651",
  },
  {
    guide: "#DDF1EC",
    filled: "#21AAA5",
  },
  {
    guide: "#D5ECE7",
    filled: "#159295",
  },
];

const CENTER_RING_GUIDE = "#E9B4A5";
const CENTER_RING_FILLED = "#C94C2C";
const CENTER_HOLE_COLOR = "#FFFDF8";

const CENTER = (FLOWER_GRID_SIZE - 1) / 2;

function getDistance(row: number, col: number) {
  const dx = col - CENTER;
  const dy = row - CENTER;

  return Math.sqrt(dx * dx + dy * dy);
}

function getAngle(row: number, col: number) {
  const dx = col - CENTER;
  const dy = row - CENTER;

  return Math.atan2(dy, dx);
}

/*
  5엽 꽃 실루엣 공식.

  반지름이 각도에 따라 커졌다 작아지면서
  꽃잎 5개와 꽃잎 사이 오목한 홈이 만들어진다.
*/
function isInsideFlower(row: number, col: number) {
  const distance = getDistance(row, col);
  const angle = getAngle(row, col);

  const baseRadius = 7.15;
  const petalDepth = 3.15;

  const maxRadius =
    baseRadius +
    petalDepth *
      Math.cos(5 * (angle + Math.PI / 2));

  return distance <= maxRadius;
}

function getPetalIndex(row: number, col: number) {
  const angle = getAngle(row, col);

  /*
    위쪽 꽃잎을 0번으로 시작해 시계 방향 배치.
  */
  const normalized =
    (angle + Math.PI / 2 + Math.PI * 2) %
    (Math.PI * 2);

  return (
    Math.round(normalized / ((Math.PI * 2) / 5)) %
    5
  );
}

function getRegion(row: number, col: number): FlowerPixelRegion {
  const distance = getDistance(row, col);

  if (distance <= 2.15) {
    return "center-hole";
  }

  if (distance <= 4.15) {
    return "center-ring";
  }

  return "petal";
}

function buildFlowerPixels(): FlowerPixel[] {
  const pixels: FlowerPixel[] = [];

  let id = 0;

  for (let row = 0; row < FLOWER_GRID_SIZE; row += 1) {
    for (let col = 0; col < FLOWER_GRID_SIZE; col += 1) {
      if (!isInsideFlower(row, col)) {
        continue;
      }

      const region = getRegion(row, col);
      const petalIndex = getPetalIndex(row, col);
      const palette = PETAL_PALETTES[petalIndex];

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
        pixels.push({
          id: id++,
          row,
          col,
          petalIndex,
          region,
          state: "filled",
          guideColor: CENTER_RING_GUIDE,
          filledColor: CENTER_RING_FILLED,
        });

        continue;
      }

      pixels.push({
        id: id++,
        row,
        col,
        petalIndex,
        region,
        state: "empty",
        guideColor: palette.guide,
        filledColor: palette.filled,
      });
    }
  }

  return pixels;
}

export const FLOWER_PIXELS = buildFlowerPixels();

export const FLOWER_MEMORY_SLOTS = FLOWER_PIXELS.filter(
  (pixel) => pixel.region === "petal",
);

/*
  추억이 적어도 한쪽부터 몰리지 않게
  5개 꽃잎을 번갈아가며 채운다.
*/
const slotsByPetal = PETAL_PALETTES.map((_, petalIndex) =>
  FLOWER_MEMORY_SLOTS.filter(
    (pixel) => pixel.petalIndex === petalIndex,
  ).sort((a, b) => {
    const distanceA = getDistance(a.row, a.col);
    const distanceB = getDistance(b.row, b.col);

    return distanceB - distanceA;
  }),
);

export const ORDERED_FLOWER_MEMORY_SLOTS: FlowerPixel[] = [];

let slotIndex = 0;

while (true) {
  let added = false;

  for (
    let petalIndex = 0;
    petalIndex < slotsByPetal.length;
    petalIndex += 1
  ) {
    const slot = slotsByPetal[petalIndex][slotIndex];

    if (!slot) {
      continue;
    }

    ORDERED_FLOWER_MEMORY_SLOTS.push(slot);
    added = true;
  }

  if (!added) {
    break;
  }

  slotIndex += 1;
}

export const FLOWER_TOTAL_COUNT =
  FLOWER_MEMORY_SLOTS.length;