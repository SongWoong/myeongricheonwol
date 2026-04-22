import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "환불정책",
  description: "명리천월 유료 서비스 환불정책.",
  robots: { index: false },
  alternates: { canonical: "/refund" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
