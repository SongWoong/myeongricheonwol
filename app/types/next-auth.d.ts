import "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      nickname?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      ageRange?: string;
      birthyear?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    provider?: string;
    kakaoId?: number;
    nickname?: string;
    profileImage?: string;
    ageRange?: string;
    birthyear?: string;
    birthday?: string;
  }
}
