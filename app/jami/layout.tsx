import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "성연(星淵) · 자미두수",
  description:
    "자미성을 비롯한 14주성을 12궁에 펼쳐 일생의 그림을 보여드립니다. 성연(星淵)의 자미두수 명반.",
  openGraph: {
    title: "성연(星淵) · 자미두수 | 명리천월",
    description: "별의 자리로 일생을 보다. 정밀 명반 + AI 해석.",
    images: ["/char-seongha.png"],
  },
  twitter: {
    title: "성연(星淵) · 자미두수",
    description: "별의 자리로 일생을 보다.",
    images: ["/char-seongha.png"],
  },
  alternates: { canonical: "/jami" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
