import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "월령(月靈) · 타로",
  description:
    "메이저 22장 + 마이너 56장, 78장의 타로 카드. 한 장 · 과거현재미래 · 켈틱 크로스. 월령(月靈)이 그대의 카드를 읽어드립니다.",
  openGraph: {
    title: "월령(月靈) · 타로 | 명리천월",
    description: "78장의 카드로 그대의 질문에 답합니다.",
    images: ["/char-wolryeong.png"],
  },
  twitter: {
    title: "월령(月靈) · 타로",
    description: "78장의 카드로 그대의 질문에 답합니다.",
    images: ["/char-wolryeong.png"],
  },
  alternates: { canonical: "/tarot" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
