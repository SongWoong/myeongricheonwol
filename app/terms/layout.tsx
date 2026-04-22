import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관",
  description: "명리천월 서비스 이용약관.",
  robots: { index: false },
  alternates: { canonical: "/terms" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
