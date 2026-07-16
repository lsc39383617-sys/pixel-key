import type { PixelCategory } from "@/types/pixel";

export const CATEGORY_OPTIONS: Array<{
  value: PixelCategory;
  label: string;
  emoji: string;
}> = [
  { value: "food", label: "음식", emoji: "🍜" },
  { value: "cafe", label: "카페", emoji: "☕" },
  { value: "travel", label: "여행", emoji: "🧳" },
  { value: "date", label: "데이트", emoji: "❤️" },
  { value: "daily", label: "일상", emoji: "📷" },
  { value: "other", label: "기타", emoji: "✨" },
];

export function getCategoryMeta(category?: PixelCategory | null) {
  return (
    CATEGORY_OPTIONS.find((option) => option.value === category) ??
    CATEGORY_OPTIONS[CATEGORY_OPTIONS.length - 1]
  );
}
