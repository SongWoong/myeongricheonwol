import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "명리천월 - 사주 타로 별자리 종합",
  description: "수천 년의 동양 지혜로 사주·타로·별자리를 종합 분석해 드립니다",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}