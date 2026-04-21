export type ServiceItem = {
  id: string;
  icon: string;
  title: string;
  desc: string;
};

export type BuilderConfig = {
  brandName: string;
  heroTag: string;
  heroTitle: string;
  heroHighlight: string;
  heroSub: string;
  ctaText: string;
  ctaSubText: string;
  primaryColor: string;
  bgColor: string;
  textColor: string;
  serviceSectionTitle: string;
  services: ServiceItem[];
  footerText: string;
};

export const defaultConfig: BuilderConfig = {
  brandName: "My Brand",
  heroTag: "WELCOME",
  heroTitle: "당신의 비즈니스를",
  heroHighlight: "한 단계 위로",
  heroSub: "간단하게 만드는\n홈페이지 제너레이터로 시작하세요",
  ctaText: "시작하기",
  ctaSubText: "더 알아보기",
  primaryColor: "#3c82ff",
  bgColor: "#010210",
  textColor: "#d0e8ff",
  serviceSectionTitle: "우리의 서비스",
  services: [
    { id: "s1", icon: "✦", title: "서비스 1", desc: "첫 번째 서비스 설명을 입력하세요" },
    { id: "s2", icon: "◈", title: "서비스 2", desc: "두 번째 서비스 설명을 입력하세요" },
    { id: "s3", icon: "❖", title: "서비스 3", desc: "세 번째 서비스 설명을 입력하세요" },
  ],
  footerText: "© 2026 My Brand. All rights reserved.",
};
