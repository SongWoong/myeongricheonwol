import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "명리천월 命理天月 — 사주·타로·자미두수·운세",
    template: "%s | 명리천월",
  },
  description:
    "정통 만세력으로 정밀 계산한 사주, 자미두수 명반, 타로 78장 풀이까지. 자운(紫雲)·월령(月靈)·성연(星淵)·밀서(密書) 네 풀이사가 그대의 운명을 읽어드립니다.",
  keywords: [
    "사주", "사주풀이", "자미두수", "타로", "타로카드",
    "운세", "오늘의운세", "꿈해몽", "토정비결",
    "만세력", "명리학", "명리천월",
  ],
  applicationName: "명리천월",
  authors: [{ name: "명리천월" }],
  creator: "명리천월",
  publisher: "명리천월",
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: "명리천월",
    title: "명리천월 命理天月 — 사주·타로·자미두수 종합 풀이",
    description:
      "정통 만세력 + AI 해석. 자운(사주) · 월령(타로) · 성연(자미두수) · 밀서(은밀한 풀이) — 네 풀이사가 그대의 운명을 읽어드립니다.",
    images: [
      {
        url: "/bg.png",
        width: 1200,
        height: 630,
        alt: "명리천월 — 운명을 읽는 네 풀이사",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "명리천월 — 사주·타로·자미두수",
    description:
      "정통 만세력 + AI 해석. 네 풀이사가 그대의 운명을 읽어드립니다.",
    images: ["/bg.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#060410",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
