import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "자운 × 월령 · 사주와 타로로 함께",
  description:
    "자운(사주)이 그대의 타고난 결을 짚고, 월령(타로)이 지금 흐름을 비춥니다. 두 풀이사가 하나의 질문에 함께 답합니다.",
  openGraph: {
    title: "자운 × 월령 · 사주와 타로 함께 | 명리천월",
    description: "두 풀이사가 하나의 질문에 함께 답합니다.",
    images: ["/char-jawun.png"],
  },
  alternates: { canonical: "/duo" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
