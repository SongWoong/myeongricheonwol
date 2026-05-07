"use client";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

type PageMode = "main" | "signup" | "find-id" | "find-pw";

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";
  const authError = params.get("error") || "";

  const [mode, setMode] = useState<PageMode>("main");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState(authError);
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const goMain = () => {
    setMode("main");
    setEmail(""); setPassword(""); setName(""); setNewPassword("");
    setError(""); setSuccess("");
  };

  // ---- 이메일 로그인 ----
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!email.trim() || !password.trim()) {
      setError("이메일과 비밀번호를 입력해주세요"); return;
    }
    setLoading(true);
    try {
      const result = await signIn("email-signup", {
        email: email.trim(), password,
        mode: "login", redirect: false,
      });
      if (result?.error) setError(result.error);
      else if (result?.ok) { router.push(callbackUrl); router.refresh(); }
    } catch { setError("로그인 중 오류가 발생했습니다"); }
    finally { setLoading(false); }
  };

  // ---- 이메일 회원가입 ----
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("이름·이메일·비밀번호를 모두 입력해주세요"); return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다"); return;
    }
    setLoading(true);
    try {
      const result = await signIn("email-signup", {
        email: email.trim(), password,
        name: name.trim(), mode: "signup", redirect: false,
      });
      if (result?.error) setError(result.error);
      else if (result?.ok) { router.push(callbackUrl); router.refresh(); }
    } catch { setError("회원가입 중 오류가 발생했습니다"); }
    finally { setLoading(false); }
  };

  // ---- 아이디(이메일) 찾기 ----
  const handleFindId = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!name.trim()) { setError("가입 시 입력한 이름을 적어주세요"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "find-email", name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(`찾은 이메일: ${data.result}`);
    } catch (err) { setError(err instanceof Error ? err.message : "오류"); }
    finally { setLoading(false); }
  };

  // ---- 비밀번호 재설정 ----
  const handleResetPw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!email.trim() || !newPassword.trim()) {
      setError("이메일과 새 비밀번호를 입력해주세요"); return;
    }
    if (newPassword.length < 6) {
      setError("새 비밀번호는 6자 이상이어야 합니다"); return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-password", email: email.trim(), newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("비밀번호가 변경되었습니다. 로그인 화면에서 로그인해주세요.");
      setTimeout(() => goMain(), 2000);
    } catch (err) { setError(err instanceof Error ? err.message : "오류"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;700&family=Diphylleia&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;background:#04030a}
        body{font-family:'Noto Serif KR',Georgia,serif}
        .page{min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:40px 20px;position:relative;overflow-x:hidden;overflow-y:auto;background:#04030a}
        .bg{position:fixed;inset:0;z-index:0}
        .bg img{width:100%;height:100%;object-fit:cover;display:block;opacity:0.4;filter:brightness(0.7)}
        .bg-tint{position:fixed;inset:0;z-index:1;background:radial-gradient(ellipse 60% 60% at 50% 50%,rgba(0,0,0,0.3),rgba(0,0,0,0.7));pointer-events:none}
        .card{position:relative;z-index:2;max-width:420px;width:100%;padding:36px 28px;background:rgba(10,8,24,0.85);backdrop-filter:blur(14px);border:1px solid rgba(180,160,240,0.2);border-radius:10px;text-align:center;color:#fff}
        .back{position:absolute;top:20px;left:20px;background:transparent;border:none;color:rgba(255,255,255,0.6);font-size:20px;cursor:pointer;z-index:3}
        .logo{font-family:'Diphylleia','Noto Serif KR',serif;font-size:30px;letter-spacing:10px;color:#fff;margin-bottom:8px;text-shadow:0 0 20px rgba(180,160,255,0.3)}
        .sub{font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.5);letter-spacing:3px;margin-bottom:26px}
        .title{font-size:18px;letter-spacing:3px;margin-bottom:10px}
        .desc{font-family:sans-serif;font-size:12px;color:rgba(255,255,255,0.65);line-height:1.8;margin-bottom:24px}
        .kakao-btn{width:100%;padding:14px;background:#FEE500;color:#000;border:none;border-radius:6px;font-family:'Noto Serif KR',serif;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:opacity 0.2s;letter-spacing:1px}
        .kakao-btn:hover{opacity:0.9}
        .kakao-icon{width:18px;height:18px;background:#000;border-radius:3px;color:#FEE500;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;line-height:1;flex-shrink:0}
        .google-btn{width:100%;padding:14px;background:#fff;color:#3c4043;border:1px solid #dadce0;border-radius:6px;font-family:'Noto Serif KR',serif;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:opacity 0.2s;letter-spacing:1px;margin-top:12px}
        .google-btn:hover{background:#f8f9fa}
        .google-icon{width:18px;height:18px;flex-shrink:0}
        .divider{display:flex;align-items:center;gap:12px;margin:18px 0;color:rgba(255,255,255,0.3);font-family:sans-serif;font-size:11px}
        .divider::before,.divider::after{content:"";flex:1;height:1px;background:rgba(255,255,255,0.1)}
        .email-link{display:block;width:100%;padding:12px;background:transparent;border:1px solid rgba(180,160,240,0.25);color:rgba(200,180,240,0.8);border-radius:6px;font-family:'Noto Serif KR',serif;font-size:13px;cursor:pointer;letter-spacing:1px;transition:all 0.2s}
        .email-link:hover{background:rgba(180,160,240,0.08);border-color:rgba(200,180,250,0.5);color:#e0d8ff}
        .email-form{text-align:left}
        .email-form input{width:100%;padding:12px;background:rgba(20,14,40,0.8);border:1px solid rgba(180,160,240,0.25);border-radius:6px;color:#e0e8ff;font-family:inherit;font-size:13px;outline:none;margin-bottom:12px;transition:border-color 0.2s}
        .email-form input:focus{border-color:rgba(180,160,250,0.6)}
        .email-form input::placeholder{color:rgba(255,255,255,0.3)}
        .email-submit{width:100%;padding:13px;background:linear-gradient(135deg,#7060e0,#9040c0);color:#fff;border:none;border-radius:6px;font-family:'Noto Serif KR',serif;font-size:14px;font-weight:700;cursor:pointer;letter-spacing:2px;transition:opacity 0.2s}
        .email-submit:disabled{opacity:0.5;cursor:not-allowed}
        .email-back{display:block;width:100%;margin-top:10px;padding:10px;background:transparent;border:none;color:rgba(200,180,240,0.6);font-family:sans-serif;font-size:11px;cursor:pointer;letter-spacing:1px}
        .email-back:hover{color:rgba(220,200,250,0.9)}
        .err{font-family:sans-serif;font-size:11px;color:#ff7090;padding:10px;background:rgba(200,40,80,0.1);border:1px solid rgba(200,60,100,0.25);border-radius:4px;margin-bottom:14px;text-align:center}
        .terms{font-family:sans-serif;font-size:10px;color:rgba(255,255,255,0.4);line-height:1.7;margin-top:18px}
        .terms a{color:rgba(180,160,240,0.7);text-decoration:none}
        .terms a:hover{text-decoration:underline}
        .bottom-links{display:flex;justify-content:center;align-items:center;gap:4px;margin-top:16px}
        .bottom-links button{background:transparent;border:none;color:rgba(200,180,240,0.7);font-family:sans-serif;font-size:11px;cursor:pointer;letter-spacing:1px;padding:4px 6px}
        .bottom-links button:hover{color:#e0d8ff;text-decoration:underline}
        .bottom-links .sep{color:rgba(255,255,255,0.2);font-size:10px}
        .success{font-family:sans-serif;font-size:12px;color:#80e0a0;padding:10px;background:rgba(80,200,140,0.1);border:1px solid rgba(100,220,160,0.25);border-radius:4px;margin-bottom:14px;text-align:center}
        .tab-row{display:flex;gap:0;margin-bottom:18px;border:1px solid rgba(180,160,240,0.2);border-radius:6px;overflow:hidden}
        .tab{flex:1;padding:10px;font-family:sans-serif;font-size:12px;text-align:center;cursor:pointer;background:transparent;border:none;color:rgba(255,255,255,0.5);transition:all 0.15s;letter-spacing:1px}
        .tab+.tab{border-left:1px solid rgba(180,160,240,0.2)}
        .tab.on{background:rgba(112,96,224,0.2);color:#e0d8ff;font-weight:600}
      `}</style>
      <div className="page">
        <div className="bg"><img src="/bg.png" alt="" /></div>
        <div className="bg-tint" />
        <button className="back" onClick={() => router.push("/")}>←</button>
        <div className="card">
          <div className="logo">命理天月</div>
          <div className="sub">MYEONGRICHEONWOL</div>

          {mode === "main" && (
            <>
              <div className="title">로그인</div>
              <button className="kakao-btn" onClick={() => signIn("kakao", { callbackUrl })}>
                <span className="kakao-icon">K</span> 카카오 로그인
              </button>
              <button className="google-btn" onClick={() => signIn("google", { callbackUrl })}>
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg> 구글 로그인
              </button>
              <div className="divider">또는</div>
              {error && <div className="err">{error}</div>}
              <form className="email-form" onSubmit={handleEmailLogin}>
                <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit" className="email-submit" disabled={loading}>
                  {loading ? "처리 중…" : "이메일 로그인"}
                </button>
              </form>
              <div className="bottom-links">
                <button onClick={() => { setMode("signup"); setError(""); setSuccess(""); }}>회원가입</button>
                <span className="sep">·</span>
                <button onClick={() => { setMode("find-id"); setError(""); setSuccess(""); }}>아이디 찾기</button>
                <span className="sep">·</span>
                <button onClick={() => { setMode("find-pw"); setError(""); setSuccess(""); }}>비밀번호 찾기</button>
              </div>
              <div className="terms">
                계속 진행하면 <a href="/terms">이용약관</a>과 <a href="/privacy">개인정보처리방침</a>에 동의한 것으로 간주합니다.
              </div>
            </>
          )}

          {mode === "signup" && (
            <>
              <div className="title">회원가입</div>
              {error && <div className="err">{error}</div>}
              <form className="email-form" onSubmit={handleSignup}>
                <input type="text" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} autoFocus />
                <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input type="password" placeholder="비밀번호 (6자 이상)" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit" className="email-submit" disabled={loading}>
                  {loading ? "처리 중…" : "회원가입"}
                </button>
                <button type="button" className="email-back" onClick={goMain}>← 로그인으로</button>
              </form>
            </>
          )}

          {mode === "find-id" && (
            <>
              <div className="title">아이디 찾기</div>
              <p className="desc">가입 시 입력한 이름으로 이메일을 찾습니다</p>
              {error && <div className="err">{error}</div>}
              {success && <div className="success">{success}</div>}
              <form className="email-form" onSubmit={handleFindId}>
                <input type="text" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} autoFocus />
                <button type="submit" className="email-submit" disabled={loading}>
                  {loading ? "찾는 중…" : "아이디 찾기"}
                </button>
                <button type="button" className="email-back" onClick={goMain}>← 로그인으로</button>
              </form>
            </>
          )}

          {mode === "find-pw" && (
            <>
              <div className="title">비밀번호 재설정</div>
              <p className="desc">가입한 이메일과 새 비밀번호를 입력하세요</p>
              {error && <div className="err">{error}</div>}
              {success && <div className="success">{success}</div>}
              <form className="email-form" onSubmit={handleResetPw}>
                <input type="email" placeholder="가입한 이메일" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
                <input type="password" placeholder="새 비밀번호 (6자 이상)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <button type="submit" className="email-submit" disabled={loading}>
                  {loading ? "변경 중…" : "비밀번호 재설정"}
                </button>
                <button type="button" className="email-back" onClick={goMain}>← 로그인으로</button>
              </form>
            </>
          )}
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
