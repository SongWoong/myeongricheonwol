import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "토정비결",
  description:
    "토정 이지함 선생의 비결을 잇는 한 해 운세. 올해의 괘 · 12개월 흐름 · 길월·흉월까지.",
  openGraph: {
    title: "토정비결 | 명리천월",
    description: "한 해의 흐름을 토정의 비결로 읽다.",
  },
  alternates: { canonical: "/tojeong" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
