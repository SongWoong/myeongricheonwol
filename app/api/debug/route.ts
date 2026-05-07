import { NextResponse } from "next/server";

export async function GET() {
  const id = process.env.KAKAO_CLIENT_ID;
  const secret = process.env.KAKAO_CLIENT_SECRET;
  const nextauthUrl = process.env.NEXTAUTH_URL;
  const nextauthSecret = process.env.NEXTAUTH_SECRET;
  const anthropic = process.env.ANTHROPIC_API_KEY;

  return NextResponse.json({
    KAKAO_CLIENT_ID: id ? `${id.slice(0, 6)}...${id.slice(-4)} (length:${id.length})` : "MISSING",
    KAKAO_CLIENT_SECRET: secret ? `*** (length:${secret.length})` : "MISSING",
    NEXTAUTH_URL: nextauthUrl || "MISSING",
    NEXTAUTH_SECRET: nextauthSecret ? `*** (length:${nextauthSecret.length})` : "MISSING",
    ANTHROPIC_API_KEY: anthropic ? `*** (length:${anthropic.length})` : "MISSING",
  });
}
