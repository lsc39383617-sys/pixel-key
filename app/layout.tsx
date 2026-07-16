import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pixel Key — 장소와 추억을 꽃으로",
  description:
    "좋아하는 장소, 사진, 날짜와 추억을 Pixel로 기록하고 한 송이 꽃으로 모아보세요.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FEF9F4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full font-sans text-stone-900">{children}</body>
    </html>
  );
}
