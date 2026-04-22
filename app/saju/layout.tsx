import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "자운(紫雲) · 사주풀이",
  description:
    "정통 만세력으로 정밀 계산한 사주 8자. 자운(紫雲)이 그대의 명식을 읽어 사랑·재물·직업·건강의 흐름을 풀어드립니다.",
  openGraph: {
    title: "자운(紫雲) · 사주풀이 | 명리천월",
    description: "만세력 정밀 계산 + AI 해석. 그대의 사주를 자운이 풀이해드립니다.",
    images: ["/char-jawun.png"],
  },
  twitter: {
    title: "자운(紫雲) · 사주풀이",
    description: "만세력 정밀 계산 + AI 해석.",
    images: ["/char-jawun.png"],
  },
  alternates: { canonical: "/saju" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
