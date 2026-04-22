import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "보관함",
  description: "그대가 받으셨던 풀이 기록.",
  robots: { index: false },
  alternates: { canonical: "/replay" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
