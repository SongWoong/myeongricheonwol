import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "오늘의 운세",
  description:
    "사주 명식과 오늘의 천기를 비교한 매일의 운세. 사랑·일·재물·조심할 일을 짧게 풀어드립니다.",
  openGraph: {
    title: "오늘의 운세 | 명리천월",
    description: "사주 + 오늘의 천기로 매일의 흐름을 읽다.",
  },
  alternates: { canonical: "/today" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
