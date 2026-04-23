import type { NextAuthOptions } from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";

export const authOptions: NextAuthOptions = {
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.provider = account.provider;
        const kakaoProfile = profile as {
          id?: number;
          properties?: { nickname?: string; profile_image?: string };
          kakao_account?: { email?: string };
        };
        token.kakaoId = kakaoProfile.id;
        token.nickname = kakaoProfile.properties?.nickname;
        token.profileImage = kakaoProfile.properties?.profile_image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        (session.user as { nickname?: string }).nickname = token.nickname as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
