"use client";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;700&family=Diphylleia&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;background:#04030a}
        body{font-family:'Noto Serif KR',Georgia,serif}
        .page{min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:40px 20px;position:relative;overflow:hidden;background:#04030a}
        .bg{position:fixed;inset:0;z-index:0}
        .bg img{width:100%;height:100%;object-fit:cover;display:block;opacity:0.4;filter:brightness(0.7)}
        .bg-tint{position:fixed;inset:0;z-index:1;background:radial-gradient(ellipse 60% 60% at 50% 50%,rgba(0,0,0,0.3),rgba(0,0,0,0.7));pointer-events:none}
        .card{position:relative;z-index:2;max-width:420px;width:100%;padding:40px 30px;background:rgba(10,8,24,0.85);backdrop-filter:blur(14px);border:1px solid rgba(180,160,240,0.2);border-radius:10px;text-align:center;color:#fff}
        .back{position:absolute;top:20px;left:20px;background:transparent;border:none;color:rgba(255,255,255,0.6);font-size:20px;cursor:pointer;z-index:3}
        .logo{font-family:'Diphylleia','Noto Serif KR',serif;font-size:30px;letter-spacing:10px;color:#fff;margin-bottom:10px;text-shadow:0 0 20px rgba(180,160,255,0.3)}
        .sub{font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.5);letter-spacing:3px;margin-bottom:30px}
        .title{font-size:18px;letter-spacing:3px;margin-bottom:14px}
        .desc{font-family:sans-serif;font-size:12px;color:rgba(255,255,255,0.65);line-height:1.8;margin-bottom:28px}
        .kakao-btn{width:100%;padding:14px;background:#FEE500;color:#000;border:none;border-radius:6px;font-family:'Noto Serif KR',serif;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:opacity 0.2s;letter-spacing:1px}
        .kakao-btn:hover{opacity:0.9}
        .kakao-icon{width:18px;height:18px;display:inline-block;background:#000;border-radius:3px;color:#FEE500;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;line-height:1}
        .divider{display:flex;align-items:center;gap:12px;margin:20px 0;color:rgba(255,255,255,0.3);font-family:sans-serif;font-size:11px}
        .divider::before,.divider::after{content:"";flex:1;height:1px;background:rgba(255,255,255,0.1)}
        .terms{font-family:sans-serif;font-size:10px;color:rgba(255,255,255,0.4);line-height:1.7;margin-top:20px}
        .terms a{color:rgba(180,160,240,0.7);text-decoration:none}
        .terms a:hover{text-decoration:underline}
      `}</style>
      <div className="page">
        <div className="bg"><img src="/bg.png" alt="" /></div>
        <div className="bg-tint" />
        <button className="back" onClick={() => router.push("/")}>←</button>
        <div className="card">
          <div className="logo">命理天月</div>
          <div className="sub">MYEONGRICHEONWOL</div>
          <div className="title">로그인 · 회원가입</div>
          <div className="desc">
            한 번의 로그인으로 풀이 기록을<br/>
            어디서나 불러올 수 있습니다
          </div>
          <button className="kakao-btn" onClick={() => signIn("kakao", { callbackUrl })}>
            <span className="kakao-icon">K</span>
            카카오로 시작하기
          </button>
          <div className="divider">SOON</div>
          <div className="terms">
            계속 진행하면 <a href="/terms">이용약관</a>과<br/>
            <a href="/privacy">개인정보처리방침</a>에 동의한 것으로 간주합니다.
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{background:"#04030a",minHeight:"100dvh"}}/>}>
      <LoginContent />
    </Suspense>
  );
}
