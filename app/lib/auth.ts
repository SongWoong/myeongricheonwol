import type { NextAuthOptions } from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { findUserByEmail, createUser, verifyPassword } from "./user-store";

const providers: NextAuthOptions["providers"] = [
  KakaoProvider({
    clientId: process.env.KAKAO_CLIENT_ID!,
    clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
    checks: ["state"], // PKCE 비활성화 (카카오 미지원)
    authorization: {
      params: { scope: "profile_nickname,profile_image" },
    },
    profile(profile) {
      return {
        id: String(profile.id),
        name: profile.properties?.nickname,
        email: profile.kakao_account?.email,
        image: profile.properties?.profile_image,
      };
    },
  }),
];

// Google 로그인은 GOOGLE_CLIENT_ID가 실제 값이 있을 때만 활성화
const hasGoogle = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID.length > 0);
if (hasGoogle) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  );
}

// 이메일 회원가입/로그인 (Credentials Provider)
providers.push(
  CredentialsProvider({
    id: "email-signup",
    name: "이메일",
    credentials: {
      email: { label: "이메일", type: "email" },
      password: { label: "비밀번호", type: "password" },
      name: { label: "이름", type: "text" },
      mode: { label: "모드", type: "text" }, // "login" | "signup"
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("이메일과 비밀번호를 입력해주세요");
      }

      const { email, password, name: inputName, mode } = credentials;
      const isSignup = mode === "signup";

      // 이메일 형식 간단 검증
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("올바른 이메일 주소를 입력해주세요");
      }

      // 비밀번호 최소 길이
      if (password.length < 6) {
        throw new Error("비밀번호는 6자 이상이어야 합니다");
      }

      if (isSignup) {
        if (!inputName || inputName.trim().length === 0) {
          throw new Error("이름을 입력해주세요");
        }
        const newUser = createUser(email, password, inputName.trim());
        return {
          id: newUser.email,
          email: newUser.email,
          name: newUser.name,
          nickname: newUser.name,
        };
      }

      // 로그인
      const user = findUserByEmail(email);
      if (!user) {
        throw new Error("가입되지 않은 이메일입니다. 회원가입을 먼저 해주세요");
      }
      if (!verifyPassword(user, password)) {
        throw new Error("비밀번호가 일치하지 않습니다");
      }

      return {
        id: user.email,
        email: user.email,
        name: user.name,
        nickname: user.name,
      };
    },
  })
);

export const authOptions: NextAuthOptions = {
  providers,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account && profile) {
        token.provider = account.provider;
        if (account.provider === "kakao") {
          const kakaoProfile = profile as {
            id?: number;
            properties?: { nickname?: string; profile_image?: string };
            kakao_account?: { email?: string; age_range?: string; birthyear?: string; birthday?: string };
            age_range?: string;
            birthyear?: string;
            birthday?: string;
          };
          token.kakaoId = kakaoProfile.id;
          token.nickname = kakaoProfile.properties?.nickname;
          token.profileImage = kakaoProfile.properties?.profile_image;
          token.ageRange = kakaoProfile.age_range;
          token.birthyear = kakaoProfile.birthyear;
          token.birthday = kakaoProfile.birthday;
        } else if (account.provider === "google") {
          const googleProfile = profile as {
            name?: string;
            picture?: string;
            email?: string;
          };
          token.nickname = googleProfile.name;
          token.profileImage = googleProfile.picture;
        }
      }
      // Credentials(이메일) 로그인 시: user 객체에서 nickname 전달
      if (user && !token.nickname) {
        token.nickname = (user as { nickname?: string }).nickname || user.name || undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        (session.user as { nickname?: string }).nickname = token.nickname as string | undefined;
        (session.user as { ageRange?: string }).ageRange = token.ageRange as string | undefined;
        (session.user as { birthyear?: string }).birthyear = token.birthyear as string | undefined;
      }
      return session;
    },
  },
  // pages: {
  //   signIn: "/login",
  // },
};
