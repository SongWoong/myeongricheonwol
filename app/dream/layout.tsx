import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "꿈 해몽",
  description:
    "간밤의 꿈에 담긴 상징과 의미. 길몽·흉몽 판정부터 오늘의 조언까지.",
  openGraph: {
    title: "꿈 해몽 | 명리천월",
    description: "꿈에 담긴 상징과 의미를 풀어드립니다.",
  },
  alternates: { canonical: "/dream" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
