import { NextRequest, NextResponse } from "next/server";
import { findEmailByName, findUserByEmail, updatePassword, userExists } from "@/app/lib/user-store";

/**
 * POST /api/auth/help
 * body: { action: "find-email" | "find-password" | "reset-password", name?, email?, newPassword? }
 */
export async function POST(req: NextRequest) {
  try {
    const { action, name, email, newPassword } = await req.json();

    if (action === "find-email") {
      // 이름으로 이메일 찾기
      if (!name || name.trim().length === 0) {
        return NextResponse.json({ error: "이름을 입력해주세요" }, { status: 400 });
      }
      const user = findEmailByName(name.trim());
      if (!user) {
        return NextResponse.json({ error: "해당 이름으로 가입된 계정이 없습니다" }, { status: 404 });
      }
      // 이메일 일부만 마스킹해서 반환
      const masked = maskEmail(user.email);
      return NextResponse.json({ result: masked });
    }

    if (action === "find-password") {
      // 이메일 존재 확인 + 비밀번호 재설정 가능 여부
      if (!email || email.trim().length === 0) {
        return NextResponse.json({ error: "이메일을 입력해주세요" }, { status: 400 });
      }
      const exists = userExists(email.trim());
      if (!exists) {
        return NextResponse.json({ error: "가입되지 않은 이메일입니다" }, { status: 404 });
      }
      return NextResponse.json({ result: true });
    }

    if (action === "reset-password") {
      if (!email || !newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: "이메일과 새 비밀번호(6자 이상)를 입력해주세요" }, { status: 400 });
      }
      const user = findUserByEmail(email.trim());
      if (!user) {
        return NextResponse.json({ error: "가입되지 않은 이메일입니다" }, { status: 404 });
      }
      updatePassword(email.trim(), newPassword);
      return NextResponse.json({ result: true });
    }

    return NextResponse.json({ error: "올바르지 않은 요청입니다" }, { status: 400 });
  } catch (err) {
    console.error("[/api/auth/help]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}
