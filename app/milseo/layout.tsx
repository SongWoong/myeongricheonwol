import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "밀서(密書) · 19+",
  description:
    "19세 이상 성인 전용. 사주에 새겨진 숨겨진 욕망·매력·은밀한 인연. 밀서(密書)가 비밀을 속삭여드립니다.",
  openGraph: {
    title: "밀서(密書) · 19+ | 명리천월",
    description: "19세 이상 — 사주가 보여주는 그대의 은밀한 결.",
    images: ["/char-milseo.png"],
  },
  twitter: {
    title: "밀서(密書) · 19+",
    description: "19세 이상 — 사주가 보여주는 그대의 은밀한 결.",
    images: ["/char-milseo.png"],
  },
  robots: { index: false, follow: false },
  alternates: { canonical: "/milseo" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
