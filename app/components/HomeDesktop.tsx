"use client";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { BusinessInfo } from "@/app/components/BusinessInfo";

interface CharacterDef {
  id: string;
  name: string;
  hanja: string;
  role: string;
  desc: string;
  tag: string;
  adult: boolean;
  image: string;
  color: string;
}

interface Props {
  characters: CharacterDef[];
}

export function HomeDesktop({ characters }: Props) {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <div className="d-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;700&family=Cinzel:wght@400;500&family=Diphylleia&display=swap');

        /* 데스크톱 뷰 전역 override — 모바일 컴포넌트가 body를 flex로 만드는 것 차단 */
        @media (min-width:768px){
          html,body{background:transparent !important;display:block !important;justify-content:initial !important}
          body>div{width:100% !important}
        }

        .d-app{width:100%;min-height:100dvh;color:#fff;font-family:'Noto Serif KR',serif;position:relative;background:transparent}

        /* 브라우저 전체 = 달빛 배경만 */
        .d-bg{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none}
        .d-bg img{width:100%;height:100%;object-fit:cover;display:block}
        /* 가독성 레이어 — 전체 살짝 어둡게 + 하단 추가 */
        .d-bg-tint{position:fixed;inset:0;z-index:1;background:
          linear-gradient(180deg,rgba(0,0,0,0.2) 0%,rgba(0,0,0,0.15) 40%,rgba(0,0,0,0.55) 100%),
          radial-gradient(ellipse 60% 40% at 50% 35%,rgba(0,0,0,0.25),transparent 60%);
          pointer-events:none}

        /* 배경 느린 드리프트 — 떠다니는 느낌 */
        .d-bg img{animation:d-bg-drift 40s ease-in-out infinite alternate}
        @keyframes d-bg-drift{
          0%{transform:scale(1.02) translate(0,0)}
          50%{transform:scale(1.06) translate(-12px,-8px)}
          100%{transform:scale(1.04) translate(10px,-4px)}
        }

        /* ───────── 헤더 바 (반투명 풀와이드) ───────── */
        .d-header{position:fixed;top:0;left:0;width:100vw;z-index:100;height:72px;display:flex;align-items:center;background:rgba(10,6,18,0.5);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid rgba(255,255,255,0.08)}
        .d-header-inner{width:100%;display:flex;align-items:center;justify-content:space-between;padding:0}
        .d-logo{cursor:pointer;flex-shrink:0;white-space:nowrap;padding-left:40px}
        .d-logo-mark{font-family:'Diphylleia','Noto Serif KR',serif;font-size:22px;color:#fff;letter-spacing:8px;font-weight:500}
        .d-nav{flex:1;display:flex;align-items:center;justify-content:center;gap:40px;white-space:nowrap;padding:0 40px}
        .d-nav-item{font-family:'Noto Serif KR',serif;font-size:14px;color:rgba(255,255,255,0.85);cursor:pointer;letter-spacing:2px;transition:color 0.2s;padding:6px 0;position:relative;white-space:nowrap}
        .d-nav-item:hover{color:#fff}
        .d-nav-item:hover::after{content:"";position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);width:20px;height:1px;background:rgba(255,255,255,0.8)}
        .d-login-wrap{flex-shrink:0;padding-right:40px}
        .d-login{padding:9px 22px;font-size:13px;border:1px solid rgba(255,255,255,0.45);color:#fff;background:transparent;cursor:pointer;font-family:'Noto Serif KR',serif;letter-spacing:3px;transition:all 0.2s;white-space:nowrap}
        .d-login:hover{background:rgba(255,255,255,0.1);border-color:#fff}

        /* ───────── 히어로 (압축 — 한 화면 안) ───────── */
        .d-hero{position:relative;z-index:2;padding:110px 60px 24px;text-align:center}
        .d-hero-inner{position:relative;display:inline-block;padding:14px 36px}
        .d-hero-tag{font-family:sans-serif;font-size:11px;letter-spacing:8px;color:#fff;margin-bottom:14px;text-shadow:0 2px 12px rgba(0,0,0,1),0 0 20px rgba(0,0,0,0.8)}
        .d-hero-title{font-family:'Noto Serif KR',serif;font-size:42px;color:#fff;line-height:1.35;letter-spacing:5px;margin-bottom:12px;text-shadow:0 4px 20px rgba(0,0,0,1),0 2px 10px rgba(0,0,0,0.9);font-weight:500}
        .d-hero-title span{color:#5a9cff;text-shadow:0 4px 20px rgba(0,0,0,1),0 2px 12px rgba(0,0,0,0.9),0 0 40px rgba(100,160,255,0.7)}
        .d-hero-sub{font-family:sans-serif;font-size:14px;color:#fff;letter-spacing:3px;text-shadow:0 2px 12px rgba(0,0,0,1),0 0 16px rgba(0,0,0,0.8);margin-bottom:20px}
        .d-hero-cta{padding:11px 28px;background:rgba(255,255,255,0.1);backdrop-filter:blur(8px);color:#fff;border:1px solid rgba(255,255,255,0.5);font-family:'Noto Serif KR',serif;font-size:13px;letter-spacing:4px;cursor:pointer;transition:all 0.2s}
        .d-hero-cta:hover{background:rgba(255,255,255,0.2);border-color:rgba(255,255,255,0.8);transform:translateY(-2px)}

        /* ───────── 섹션 (패딩 축소) ───────── */
        .d-section{position:relative;z-index:2;max-width:1400px;margin:0 auto;padding:20px 60px 40px}
        .d-sec-tag{font-family:sans-serif;font-size:11px;letter-spacing:6px;color:rgba(255,255,255,0.85);text-align:center;margin-bottom:6px;text-shadow:0 2px 10px rgba(0,0,0,0.95),0 0 20px rgba(0,0,0,0.7)}
        .d-sec-title{font-family:'Noto Serif KR',serif;font-size:22px;color:#fff;text-align:center;letter-spacing:4px;margin-bottom:24px;font-weight:500;text-shadow:0 2px 16px rgba(0,0,0,0.95),0 0 30px rgba(0,0,0,0.8)}

        /* ───────── 캐릭터 4명 한 줄 (컴팩트) ───────── */
        .d-char-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
        .d-char-card{position:relative;cursor:pointer;overflow:hidden;background:rgba(0,0,0,0.35);backdrop-filter:blur(8px);transition:all 0.3s}
        .d-char-card:hover{transform:translateY(-6px);box-shadow:0 16px 40px rgba(0,0,0,0.5)}
        .d-char-img{position:relative;aspect-ratio:3/4;overflow:hidden;width:100%}
        .d-char-img img{width:100%;height:100%;object-fit:cover;object-position:top;display:block;transition:transform 0.5s}
        .d-char-card:hover .d-char-img img{transform:scale(1.05)}
        .d-char-img-fade{position:absolute;inset:0;background:linear-gradient(to bottom,transparent 55%,rgba(0,0,0,0.95));pointer-events:none}
        .d-char-name-overlay{position:absolute;bottom:14px;left:0;right:0;text-align:center;z-index:2}
        .d-char-name{font-size:22px;color:#fff;letter-spacing:6px;text-shadow:0 2px 12px rgba(0,0,0,0.95);margin-bottom:3px;font-weight:500}
        .d-char-hanja{font-size:10px;color:rgba(255,255,255,0.6);letter-spacing:5px}
        .d-char-body{padding:14px 16px 18px;text-align:center;background:rgba(0,0,0,0.55)}
        .d-char-role{font-family:sans-serif;font-size:11px;font-weight:700;letter-spacing:4px;margin-bottom:6px}
        .d-char-desc{font-family:sans-serif;font-size:11.5px;color:rgba(255,255,255,0.72);line-height:1.5;margin-bottom:10px;min-height:34px}
        .d-char-tag{font-family:sans-serif;font-size:10px;padding:4px 10px;display:inline-block;letter-spacing:2px}
        .d-tag-free{background:rgba(60,120,200,0.3);color:#a8d0ff;border:1px solid rgba(100,160,240,0.5)}
        .d-tag-adult{background:rgba(180,50,90,0.3);color:#ff9ab0;border:1px solid rgba(200,80,120,0.5)}

        /* ───────── 하단 2칸 섹션 (혜원 + 명서) ───────── */
        .d-bottom-section{position:relative;z-index:2;max-width:1400px;margin:0 auto;padding:20px 60px 60px}
        .d-bottom-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
        .d-bot-card{position:relative;overflow:hidden;cursor:pointer;backdrop-filter:blur(8px);transition:all 0.3s;display:grid;grid-template-columns:220px 1fr;min-height:220px}
        .d-bot-card:hover{transform:translateY(-4px)}
        .d-bot-card.hw{background:linear-gradient(135deg,rgba(30,20,70,0.85),rgba(70,25,95,0.85));box-shadow:none}
        .d-bot-card.hw:hover{box-shadow:0 16px 40px rgba(140,100,220,0.45)}
        .d-bot-card.ms{background:linear-gradient(135deg,rgba(20,14,48,0.88),rgba(50,30,90,0.85));box-shadow:none}
        .d-bot-card.ms:hover{box-shadow:0 16px 40px rgba(100,70,180,0.4)}
        .d-bot-img{position:relative;overflow:hidden}
        .d-bot-img img{width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.6s}
        .d-bot-img.hw img{object-position:center 10%}
        .d-bot-img.ms img{object-position:center 30%}
        .d-bot-card:hover .d-bot-img img{transform:scale(1.05)}
        .d-bot-img-fade{position:absolute;top:0;right:0;width:55%;height:100%;background:linear-gradient(to right,transparent,rgba(30,14,60,0.95))}
        .d-bot-text{position:relative;z-index:2;padding:28px 30px;display:flex;flex-direction:column;justify-content:center}
        .d-bot-mark{font-family:sans-serif;font-size:9px;letter-spacing:5px;color:#c0a8e8;margin-bottom:8px}
        .d-bot-name{font-family:'Diphylleia','Noto Serif KR',serif;font-size:26px;color:#fff;letter-spacing:6px;margin-bottom:4px;text-shadow:0 2px 16px rgba(0,0,0,0.9),0 0 16px rgba(200,160,255,0.3)}
        .d-bot-role{font-family:sans-serif;font-size:10px;color:rgba(255,255,255,0.5);letter-spacing:3px;margin-bottom:14px}
        .d-bot-desc{font-family:sans-serif;font-size:12.5px;color:rgba(255,255,255,0.82);line-height:1.8;margin-bottom:18px;text-shadow:0 1px 6px rgba(0,0,0,0.7)}
        .d-bot-cta{font-family:'Noto Serif KR',serif;font-size:11px;letter-spacing:2px;color:#fff;padding:8px 20px;border:1px solid rgba(200,160,255,0.45);background:rgba(200,160,255,0.06);transition:all 0.2s;align-self:flex-start}
        .d-bot-card:hover .d-bot-cta{background:rgba(200,160,255,0.2);border-color:#fff}

        /* ───────── 푸터 (컴팩트) ───────── */
        .d-footer{position:relative;z-index:2;padding:18px 60px;background:rgba(0,0,0,0.55);backdrop-filter:blur(10px);border-top:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px}
        .d-footer-brand{font-family:'Diphylleia','Noto Serif KR',serif;font-size:16px;color:#fff;letter-spacing:5px}
        .d-footer-links{display:flex;gap:20px;flex-wrap:wrap}
        .d-footer-links span{font-family:sans-serif;font-size:12px;color:rgba(255,255,255,0.6);cursor:pointer;letter-spacing:1.5px}
        .d-footer-links span:hover{color:#fff}
        .d-footer-meta{font-family:sans-serif;font-size:10.5px;color:rgba(255,255,255,0.4);letter-spacing:1px}
      `}</style>

      <div className="d-bg"><img src="/bg.png" alt="" /></div>
      <div className="d-bg-tint" />

      <header className="d-header">
        <div className="d-header-inner">
          <div className="d-logo" onClick={() => router.push("/")}>
            <div className="d-logo-mark">命理天月</div>
          </div>
          <nav className="d-nav">
            <span className="d-nav-item" onClick={() => router.push("/saju")}>사주</span>
            <span className="d-nav-item" onClick={() => router.push("/tarot")}>타로</span>
            <span className="d-nav-item" onClick={() => router.push("/jami")}>자미두수</span>
            <span className="d-nav-item" onClick={() => router.push("/hyewon")}>혜원</span>
            <span className="d-nav-item" onClick={() => router.push("/dream")}>꿈해몽</span>
            <span className="d-nav-item" onClick={() => router.push("/today")}>오늘운세</span>
            <span className="d-nav-item" onClick={() => router.push("/tojeong")}>토정비결</span>
            <span className="d-nav-item" onClick={() => router.push("/pdf")}>사주 PDF</span>
          </nav>
          <div className="d-login-wrap">
            {session?.user ? (
              <button className="d-login" onClick={() => signOut({ callbackUrl: "/" })}>
                {(session.user as { nickname?: string }).nickname || session.user.name || "나의"} · 로그아웃
              </button>
            ) : (
              <button className="d-login" onClick={() => router.push("/login")}>로그인</button>
            )}
          </div>
        </div>
      </header>

      <section className="d-hero">
        <div className="d-hero-inner">
          <div className="d-hero-tag">SAJU · TAROT · ZIWEI · DUO</div>
          <h1 className="d-hero-title">당신의 운명을<br/><span>하늘이 말해줍니다</span></h1>
          <p className="d-hero-sub">네 풀이사가 함께하는 운명 상담</p>
        </div>
      </section>

      <section className="d-section">
        <div className="d-sec-tag">✦  S E R V I C E  ✦</div>
        <div className="d-sec-title">하늘의 언어를 읽어드립니다</div>
        <div className="d-char-grid">
          {characters.map((c) => (
            <div key={c.id} className="d-char-card" onClick={() => router.push(`/${c.id}`)}>
              <div className="d-char-img">
                <img src={c.image} alt={c.name} />
                <div className="d-char-img-fade" />
                <div className="d-char-name-overlay">
                  <div className="d-char-name">{c.name}</div>
                  <div className="d-char-hanja">{c.hanja}</div>
                </div>
              </div>
              <div className="d-char-body">
                <div className="d-char-role" style={{ color: c.color }}>{c.role}</div>
                <div className="d-char-desc">{c.desc}</div>
                <span className={`d-char-tag ${c.adult ? "d-tag-adult" : "d-tag-free"}`}>{c.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="d-bottom-section">
        <div className="d-sec-tag">✦  S P E C I A L  ✦</div>
        <div className="d-sec-title">상담과 기록, 두 가지 방법으로</div>
        <div className="d-bottom-grid">
          {/* 혜원 */}
          <div className="d-bot-card hw" onClick={() => router.push("/hyewon")}>
            <div className="d-bot-img hw">
              <img src="/char-hyewon.png" alt="혜원"
                onError={(e) => { (e.target as HTMLImageElement).src = "/char-wolryeong.png"; }}
              />
              <div className="d-bot-img-fade"/>
            </div>
            <div className="d-bot-text">
              <div className="d-bot-mark">AI CONSULTANT</div>
              <div className="d-bot-name">혜원 · 慧源</div>
              <div className="d-bot-role">사주 · 타로 통합 상담사</div>
              <div className="d-bot-desc">
                사주와 타로로 무엇이든<br/>
                자유롭게 물어보세요
              </div>
              <div className="d-bot-cta">지금 상담하기 →</div>
            </div>
          </div>
          {/* 명서 */}
          <div className="d-bot-card ms" onClick={() => router.push("/pdf")}>
            <div className="d-bot-img ms">
              <img src="/char-myeongseo.png" alt="명서"/>
              <div className="d-bot-img-fade"/>
            </div>
            <div className="d-bot-text">
              <div className="d-bot-mark">SAJU PDF</div>
              <div className="d-bot-name">명서 · 命書</div>
              <div className="d-bot-role">사주 정밀 풀이 PDF</div>
              <div className="d-bot-desc">
                나만의 사주 풀이를<br/>
                PDF 한 권으로 받아보세요
              </div>
              <div className="d-bot-cta">PDF 받기 →</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="d-footer">
        <div className="d-footer-brand">命理天月</div>
        <div className="d-footer-links">
          <span onClick={() => router.push("/replay")}>보관함</span>
          <span onClick={() => router.push("/pricing")}>이용권 안내</span>
          <span onClick={() => router.push("/account/billing")}>내 결제 내역</span>
          <span onClick={() => router.push("/terms")}>이용약관</span>
          <span onClick={() => router.push("/privacy")}>개인정보처리방침</span>
          <span onClick={() => router.push("/refund")}>환불정책</span>
        </div>
        <div style={{ marginTop: 12, marginBottom: 10 }}>
          <BusinessInfo compact />
        </div>
        <div className="d-footer-meta">© 2026 · 엔터테인먼트 목적</div>
      </footer>
    </div>
  );
}
