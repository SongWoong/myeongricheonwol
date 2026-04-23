"use client";
import { useRouter } from "next/navigation";

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

  return (
    <div className="d-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;700&family=Cinzel:wght@400;500;600&family=Diphylleia&family=Cormorant+Garamond:wght@300;400;500&display=swap');

        .d-app{width:100%;min-height:100dvh;color:#e0e6ff;font-family:'Noto Serif KR',serif;position:relative;overflow-x:hidden;background:#04030a}
        /* 브라우저 전체 배경 = 달 이미지 (고정, 풀블리드, seam 없음) */
        .d-page-bg{position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:0;pointer-events:none;overflow:hidden}
        .d-page-bg img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;object-position:center center}

        /* ───────── 배경 — 구름 + 별빛 (전체 페이지) ───────── */
        .d-bg-stars{position:fixed;inset:0;pointer-events:none;z-index:0;background-image:
          radial-gradient(2px 2px at 3% 8%,#fff,transparent),
          radial-gradient(1.5px 1.5px at 8% 22%,#b0c8ff,transparent),
          radial-gradient(2px 2px at 14% 48%,#fff,transparent),
          radial-gradient(1px 1px at 21% 70%,#d0b0ff,transparent),
          radial-gradient(2px 2px at 5% 88%,#c0a0ff,transparent),
          radial-gradient(1.5px 1.5px at 18% 12%,#fff,transparent),
          radial-gradient(1px 1px at 28% 32%,#b0c8ff,transparent),
          radial-gradient(1.5px 1.5px at 32% 58%,#fff,transparent),
          radial-gradient(1px 1px at 36% 82%,#d0b0ff,transparent),
          radial-gradient(2px 2px at 42% 18%,#fff,transparent),
          radial-gradient(1.5px 1.5px at 48% 42%,#b0c8ff,transparent),
          radial-gradient(1px 1px at 52% 68%,#fff,transparent),
          radial-gradient(2px 2px at 58% 8%,#c0a0ff,transparent),
          radial-gradient(1.5px 1.5px at 62% 36%,#fff,transparent),
          radial-gradient(1px 1px at 68% 56%,#b0c8ff,transparent),
          radial-gradient(2px 2px at 72% 78%,#fff,transparent),
          radial-gradient(1.5px 1.5px at 78% 20%,#d0b0ff,transparent),
          radial-gradient(1px 1px at 82% 44%,#fff,transparent),
          radial-gradient(2px 2px at 86% 66%,#b0c8ff,transparent),
          radial-gradient(1.5px 1.5px at 92% 14%,#fff,transparent),
          radial-gradient(1px 1px at 95% 38%,#c0a0ff,transparent),
          radial-gradient(2px 2px at 97% 62%,#fff,transparent),
          radial-gradient(1.5px 1.5px at 96% 86%,#b0c8ff,transparent);
          background-size:100% 100%;opacity:0.6;animation:d-twinkle 4s ease-in-out infinite}
        @keyframes d-twinkle{0%,100%{opacity:0.4}50%{opacity:0.85}}

        /* 구름 레이어 — 거대 blur radial로 안개처럼 */
        .d-bg-clouds{position:fixed;inset:0;pointer-events:none;z-index:1;background:
          radial-gradient(ellipse 40% 30% at 15% 20%,rgba(112,96,224,0.14),transparent 60%),
          radial-gradient(ellipse 35% 28% at 85% 15%,rgba(80,140,220,0.12),transparent 60%),
          radial-gradient(ellipse 45% 35% at 50% 45%,rgba(160,64,192,0.08),transparent 60%),
          radial-gradient(ellipse 38% 30% at 20% 70%,rgba(140,100,200,0.1),transparent 60%),
          radial-gradient(ellipse 42% 32% at 80% 75%,rgba(100,80,180,0.12),transparent 60%),
          radial-gradient(ellipse 35% 28% at 50% 95%,rgba(80,60,160,0.1),transparent 60%);
          animation:d-clouds-drift 40s ease-in-out infinite alternate}
        @keyframes d-clouds-drift{0%{transform:translate(0,0)}100%{transform:translate(-20px,15px)}}

        .d-bg-clouds2{position:fixed;inset:0;pointer-events:none;z-index:1;background:
          radial-gradient(ellipse 50% 40% at 70% 30%,rgba(180,140,240,0.08),transparent 60%),
          radial-gradient(ellipse 45% 35% at 30% 50%,rgba(120,100,220,0.07),transparent 60%),
          radial-gradient(ellipse 55% 40% at 90% 60%,rgba(100,80,200,0.08),transparent 60%),
          radial-gradient(ellipse 48% 38% at 10% 85%,rgba(160,100,200,0.07),transparent 60%);
          filter:blur(30px);animation:d-clouds-drift2 55s ease-in-out infinite alternate}
        @keyframes d-clouds-drift2{0%{transform:translate(0,0) scale(1)}100%{transform:translate(25px,-20px) scale(1.05)}}

        /* ───────── 헤더 — 풀와이드 가로 바 ───────── */
        .d-header{position:fixed;top:0;left:0;right:0;width:100%;z-index:100;background:rgba(4,3,10,0.55);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid rgba(180,160,255,0.12);height:72px;display:flex;align-items:center}
        .d-header-inner{width:100%;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 56px;gap:48px;white-space:nowrap}
        .d-logo{cursor:pointer;justify-self:start}
        .d-logo-mark{font-family:'Diphylleia','Noto Serif KR',serif;color:#fff;font-size:24px;letter-spacing:8px;font-weight:500;line-height:1;white-space:nowrap;text-shadow:0 0 14px rgba(180,160,255,0.25)}
        .d-nav{display:flex;align-items:center;justify-content:center;gap:36px;white-space:nowrap;justify-self:center}
        .d-nav-item{font-family:'Noto Serif KR',serif;font-size:14px;color:rgba(255,255,255,0.82);cursor:pointer;letter-spacing:3px;transition:color 0.2s;position:relative;padding:6px 0;white-space:nowrap}
        .d-nav-item:hover{color:#fff}
        .d-nav-item:hover::after{content:"";position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);width:20px;height:1px;background:rgba(220,200,255,0.8)}
        .d-login{padding:10px 26px;font-size:13px;border:1px solid rgba(255,255,255,0.4);color:#fff;border-radius:2px;background:transparent;cursor:pointer;font-family:'Noto Serif KR',serif;letter-spacing:3px;transition:all 0.2s;white-space:nowrap;justify-self:end}
        .d-login:hover{background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.7)}
        .d-login::before{content:"";position:absolute;inset:0;background:linear-gradient(to right,rgba(180,160,255,0.15),transparent);opacity:0;transition:opacity 0.3s}
        .d-login:hover{border-color:rgba(220,200,255,0.8);color:#fff}
        .d-login:hover::before{opacity:1}

        /* ───────── 히어로 (배경은 페이지 전체에서 상속) ───────── */
        .d-hero{position:relative;width:100%;height:100vh;min-height:760px;display:flex;align-items:center;justify-content:center;z-index:2}
        .d-hero-vignette{position:absolute;inset:0;background:radial-gradient(ellipse 70% 80% at 50% 45%,transparent 30%,rgba(4,3,10,0.5));z-index:2;pointer-events:none}

        /* (히어로 코너 액자 제거됨) */

        .d-hero-text{position:relative;z-index:4;text-align:center;padding:0 60px;max-width:1100px;animation:d-fade-up 1.4s ease-out}
        @keyframes d-fade-up{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        .d-hero-mark{font-family:'Diphylleia','Noto Serif KR',serif;font-size:96px;color:rgba(220,200,255,0.55);letter-spacing:36px;margin-bottom:36px;text-shadow:0 0 40px rgba(180,160,255,0.4);animation:d-mark-pulse 5s ease-in-out infinite;font-weight:500;line-height:1}
        @keyframes d-mark-pulse{0%,100%{opacity:0.55;letter-spacing:36px}50%{opacity:0.85;letter-spacing:40px}}
        .d-hero-divider{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:28px}
        .d-hero-divider-line{width:60px;height:1px;background:linear-gradient(to right,transparent,rgba(220,200,255,0.6))}
        .d-hero-divider-line.r{background:linear-gradient(to left,transparent,rgba(220,200,255,0.6))}
        .d-hero-divider-dot{width:5px;height:5px;background:rgba(220,200,255,0.7);border-radius:50%;box-shadow:0 0 10px rgba(220,200,255,0.5)}
        .d-hero-tag{font-family:'Cormorant Garamond',serif;font-size:18px;letter-spacing:14px;color:rgba(220,200,255,0.85);margin-bottom:32px;text-shadow:0 1px 8px rgba(0,0,0,0.95);font-weight:300;font-style:italic}
        .d-hero-title{font-size:78px;color:#fff;line-height:1.35;margin-bottom:32px;text-shadow:0 4px 40px rgba(0,0,0,0.95);letter-spacing:8px;font-weight:400}
        .d-hero-title span{color:#a8c8ff;text-shadow:0 4px 40px rgba(0,0,0,0.95),0 0 50px rgba(140,180,255,0.65)}
        .d-hero-sub{font-family:sans-serif;font-size:18px;color:rgba(255,255,255,0.85);text-shadow:0 1px 10px rgba(0,0,0,0.95);letter-spacing:5px;margin-bottom:50px}
        .d-hero-cta{display:inline-flex;align-items:center;gap:12px;padding:16px 38px;background:linear-gradient(135deg,rgba(180,160,255,0.2),rgba(140,120,220,0.15));color:#fff;border:1px solid rgba(220,200,255,0.5);font-family:'Noto Serif KR',serif;font-size:14px;letter-spacing:5px;cursor:pointer;backdrop-filter:blur(8px);transition:all 0.25s}
        .d-hero-cta:hover{background:linear-gradient(135deg,rgba(180,160,255,0.35),rgba(140,120,220,0.25));border-color:rgba(240,220,255,0.8);transform:translateY(-2px);box-shadow:0 10px 30px rgba(140,100,220,0.35)}
        .d-hero-scroll{position:absolute;bottom:40px;left:50%;transform:translateX(-50%);font-family:'Cinzel',sans-serif;font-size:10px;letter-spacing:6px;color:rgba(255,255,255,0.55);z-index:4;display:flex;flex-direction:column;align-items:center;gap:10px}
        .d-hero-scroll-line{width:1px;height:30px;background:linear-gradient(to bottom,rgba(255,255,255,0.5),transparent);animation:d-line-pulse 2s ease-in-out infinite}
        @keyframes d-line-pulse{0%,100%{opacity:0.3;transform:scaleY(1)}50%{opacity:1;transform:scaleY(1.3)}}

        /* ───────── 통계 띠 (경계선 없이) ───────── */
        .d-stats-band{position:relative;z-index:3;padding:44px 0;background:transparent}
        .d-stats{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr 1fr;padding:0 60px}
        .d-stat{text-align:center;padding:0 28px;position:relative}
        .d-stat+.d-stat::before{content:"";position:absolute;left:0;top:15%;bottom:15%;width:1px;background:linear-gradient(to bottom,transparent,rgba(180,160,255,0.4),transparent)}
        .d-stat-num{font-family:'Diphylleia','Noto Serif KR',serif;font-size:42px;color:#a8c8ff;letter-spacing:2px;margin-bottom:10px;text-shadow:0 0 20px rgba(140,180,255,0.45);line-height:1;font-weight:500}
        .d-stat-label{font-family:sans-serif;font-size:12px;color:rgba(255,255,255,0.6);letter-spacing:6px}

        /* ───────── 섹션 공통 ───────── */
        .d-section{position:relative;z-index:3;max-width:1500px;margin:0 auto;padding:160px 60px}
        .d-sec-frame{position:relative;text-align:center;margin-bottom:90px}
        .d-sec-symbol{font-family:'Noto Serif KR',serif;font-size:32px;color:rgba(180,160,255,0.4);letter-spacing:0;margin-bottom:18px;font-weight:300}
        .d-sec-tag{font-family:'Cormorant Garamond',serif;font-size:14px;letter-spacing:12px;color:#9080d0;margin-bottom:18px;font-style:italic}
        .d-sec-title{font-family:'Noto Serif KR',serif;font-size:46px;color:#fff;letter-spacing:10px;margin-bottom:22px;font-weight:500;text-shadow:0 0 28px rgba(180,160,255,0.25);position:relative;display:inline-block}
        .d-sec-title::before,.d-sec-title::after{content:"";position:absolute;top:50%;width:50px;height:1px;background:linear-gradient(to right,transparent,rgba(180,160,255,0.5))}
        .d-sec-title::before{right:calc(100% + 24px)}
        .d-sec-title::after{left:calc(100% + 24px);background:linear-gradient(to left,transparent,rgba(180,160,255,0.5))}
        .d-sec-sub{font-family:sans-serif;font-size:15px;color:rgba(255,255,255,0.55);letter-spacing:3px;line-height:2}

        /* ───────── 캐릭터 카드 ───────── */
        .d-char-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:32px}
        .d-char-card{position:relative;cursor:pointer;background:rgba(8,6,22,0.5);border:none;transition:all 0.4s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column;animation:d-card-fade 0.8s ease-out backwards}
        .d-char-card:nth-child(1){animation-delay:0.05s}
        .d-char-card:nth-child(2){animation-delay:0.15s}
        .d-char-card:nth-child(3){animation-delay:0.25s}
        .d-char-card:nth-child(4){animation-delay:0.35s}
        @keyframes d-card-fade{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .d-char-card:hover{transform:translateY(-12px);box-shadow:0 28px 70px rgba(80,60,150,0.5)}
        .d-char-num{display:none}
        .d-char-img{position:relative;aspect-ratio:3/4;overflow:hidden}
        .d-char-img img{width:100%;height:100%;object-fit:cover;object-position:top;display:block;transition:transform 0.7s}
        .d-char-card:hover .d-char-img img{transform:scale(1.08)}
        .d-char-img-fade{position:absolute;inset:0;background:linear-gradient(to bottom,transparent 50%,rgba(8,6,22,0.97) 100%);pointer-events:none}
        .d-char-name-overlay{position:absolute;bottom:22px;left:0;right:0;text-align:center;z-index:2;padding:0 16px}
        .d-char-name{font-family:'Noto Serif KR',serif;font-size:30px;color:#fff;letter-spacing:10px;text-shadow:0 2px 14px rgba(0,0,0,0.95);margin-bottom:5px;font-weight:500}
        .d-char-hanja{font-size:11px;color:rgba(255,255,255,0.55);letter-spacing:7px}
        .d-char-body{padding:24px 24px 28px;text-align:center;background:rgba(8,6,22,0.85)}
        .d-char-role{font-family:sans-serif;font-size:11px;font-weight:700;letter-spacing:6px;margin-bottom:12px}
        .d-char-desc{font-family:sans-serif;font-size:13px;color:rgba(255,255,255,0.62);line-height:1.7;margin-bottom:16px;min-height:44px}
        .d-char-tag{font-family:sans-serif;font-size:10px;padding:6px 14px;border-radius:1px;display:inline-block;letter-spacing:2.5px}
        .d-tag-free{background:rgba(40,80,200,0.22);color:#90b0e0;border:1px solid rgba(60,100,220,0.3)}
        .d-tag-adult{background:rgba(160,30,80,0.22);color:#e08090;border:1px solid rgba(180,40,90,0.35)}

        /* ───────── 듀오 섹션 ───────── */
        .d-duo-section{position:relative;z-index:3;width:100%;padding:60px 0 160px}
        .d-duo-inner{max-width:1500px;margin:0 auto;padding:0 60px}
        .d-duo-card{position:relative;overflow:hidden;cursor:pointer;background:linear-gradient(135deg,rgba(40,30,80,0.9),rgba(80,30,100,0.9));border:none;transition:all 0.35s;display:grid;grid-template-columns:1fr 1.5fr 1fr;min-height:420px}
        .d-duo-card:hover{transform:translateY(-5px);box-shadow:0 28px 70px rgba(140,100,220,0.5)}
        .d-duo-bg{position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,rgba(180,140,240,0.22),transparent 60%);pointer-events:none}
        .d-duo-img{position:relative;overflow:hidden}
        .d-duo-img img{width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.7s}
        .d-duo-card:hover .d-duo-img img{transform:scale(1.06)}
        .d-duo-img.left img{object-position:right 18%}
        .d-duo-img.right img{object-position:left 18%}
        .d-duo-img-fade-l{position:absolute;top:0;right:0;width:55%;height:100%;background:linear-gradient(to right,transparent,rgba(45,20,75,0.95))}
        .d-duo-img-fade-r{position:absolute;top:0;left:0;width:55%;height:100%;background:linear-gradient(to left,transparent,rgba(60,20,80,0.95))}
        .d-duo-text{position:relative;z-index:2;padding:64px 36px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
        .d-duo-mark{font-family:'Cormorant Garamond',serif;font-size:13px;letter-spacing:10px;color:#c0a8e8;margin-bottom:20px;font-style:italic}
        .d-duo-name{font-family:'Diphylleia','Noto Serif KR',serif;font-size:54px;color:#fff;letter-spacing:14px;margin-bottom:24px;text-shadow:0 0 36px rgba(220,180,255,0.55);font-weight:500;line-height:1.2}
        .d-duo-divider{display:flex;align-items:center;gap:10px;margin-bottom:26px}
        .d-duo-divider-line{width:50px;height:1px;background:linear-gradient(to right,transparent,rgba(220,180,255,0.7))}
        .d-duo-divider-line.r{background:linear-gradient(to left,transparent,rgba(220,180,255,0.7))}
        .d-duo-divider-dot{width:4px;height:4px;background:rgba(220,180,255,0.8);border-radius:50%;box-shadow:0 0 10px rgba(220,180,255,0.6)}
        .d-duo-desc{font-family:sans-serif;font-size:15px;color:rgba(255,255,255,0.8);line-height:2.05;margin-bottom:32px;letter-spacing:1.5px}
        .d-duo-cta{font-family:'Noto Serif KR',serif;font-size:13px;letter-spacing:5px;color:#fff;padding:14px 36px;border:1px solid rgba(220,180,255,0.5);background:rgba(220,180,255,0.05);transition:all 0.25s}
        .d-duo-card:hover .d-duo-cta{background:rgba(220,180,255,0.18);border-color:rgba(240,200,255,0.85);transform:translateY(-2px)}

        /* ───────── 푸터 ───────── */
        .d-footer{position:relative;z-index:3;border-top:1px solid rgba(140,120,220,0.12);padding:70px 60px 56px;background:rgba(4,3,10,0.7);backdrop-filter:blur(10px)}
        .d-footer-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr auto;gap:48px;align-items:center}
        .d-footer-brand{display:flex;align-items:center;gap:18px}
        .d-footer-logo-mark{font-family:'Diphylleia','Noto Serif KR',serif;font-size:30px;color:#fff;letter-spacing:8px;font-weight:500}
        .d-footer-brand-text{display:flex;flex-direction:column;border-left:1px solid rgba(180,160,255,0.25);padding-left:18px}
        .d-footer-brand-name{font-family:'Noto Serif KR',serif;font-size:13px;color:rgba(255,255,255,0.7);letter-spacing:4px;margin-bottom:6px}
        .d-footer-brand-meta{font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.42);letter-spacing:1px;line-height:1.7}
        .d-footer-links{display:flex;gap:24px;flex-wrap:wrap;justify-content:flex-end}
        .d-footer-links span{font-family:'Noto Serif KR',serif;font-size:13px;color:rgba(180,160,240,0.7);cursor:pointer;letter-spacing:3px;transition:color 0.2s}
        .d-footer-links span:hover{color:#c0a8e8}
      `}</style>

      <div className="d-page-bg"><img src="/bg.png" alt="" /></div>
      <div className="d-bg-stars" />
      <div className="d-bg-clouds" />
      <div className="d-bg-clouds2" />

      <header className="d-header">
        <div className="d-header-inner">
          <div className="d-logo" onClick={() => router.push("/")}>
            <div className="d-logo-mark">命理天月</div>
          </div>
          <nav className="d-nav">
            <span className="d-nav-item" onClick={() => router.push("/saju")}>사주</span>
            <span className="d-nav-item" onClick={() => router.push("/tarot")}>타로</span>
            <span className="d-nav-item" onClick={() => router.push("/jami")}>자미두수</span>
            <span className="d-nav-item" onClick={() => router.push("/duo")}>자운×월령</span>
            <span className="d-nav-item" onClick={() => router.push("/dream")}>꿈해몽</span>
            <span className="d-nav-item" onClick={() => router.push("/today")}>오늘운세</span>
            <span className="d-nav-item" onClick={() => router.push("/tojeong")}>토정비결</span>
          </nav>
          <button className="d-login">로그인</button>
        </div>
      </header>

      <section className="d-hero">
        <div className="d-hero-vignette" />
        <div className="d-hero-text">
          <div className="d-hero-mark">命 理 天 月</div>
          <div className="d-hero-divider">
            <div className="d-hero-divider-line" />
            <div className="d-hero-divider-dot" />
            <div className="d-hero-divider-line r" />
          </div>
          <div className="d-hero-tag">SAJU · TAROT · ZIWEI · DUO</div>
          <h1 className="d-hero-title">당신의 운명을<br/><span>하늘이 말해줍니다</span></h1>
          <p className="d-hero-sub">네 풀이사가 함께하는 운명 상담</p>
          <button className="d-hero-cta" onClick={() => router.push("/saju")}>풀이 시작하기 →</button>
        </div>
        <div className="d-hero-scroll">
          <span>SCROLL</span>
          <div className="d-hero-scroll-line" />
        </div>
      </section>

      <div className="d-stats-band">
        <div className="d-stats">
          <div className="d-stat"><div className="d-stat-num">24萬+</div><div className="d-stat-label">누적 분석</div></div>
          <div className="d-stat"><div className="d-stat-num">4.9★</div><div className="d-stat-label">평균 만족도</div></div>
          <div className="d-stat"><div className="d-stat-num">精密</div><div className="d-stat-label">심층 해석</div></div>
        </div>
      </div>

      <section className="d-section">
        <div className="d-sec-frame">
          <div className="d-sec-symbol">✦</div>
          <div className="d-sec-tag">SERVICE</div>
          <div className="d-sec-title">하늘의 언어를 읽어드립니다</div>
          <div className="d-sec-sub">자운 · 월령 · 성연 · 밀서<br/>네 풀이사가 그대의 운명을 함께 풀어드립니다</div>
        </div>
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

      <section className="d-duo-section">
        <div className="d-duo-inner">
          <div className="d-sec-frame">
            <div className="d-sec-symbol">合</div>
            <div className="d-sec-tag">UNION</div>
            <div className="d-sec-title">운명의 합주(合奏)</div>
            <div className="d-sec-sub">두 풀이사가 하나의 질문에 함께 답합니다</div>
          </div>
          <div className="d-duo-card" onClick={() => router.push("/duo")}>
            <div className="d-duo-bg" />
            <div className="d-duo-img left">
              <img src="/char-jawun.png" alt="자운" />
              <div className="d-duo-img-fade-l" />
            </div>
            <div className="d-duo-text">
              <div className="d-duo-mark">SAJU × TAROT</div>
              <div className="d-duo-name">자운 × 월령</div>
              <div className="d-duo-divider">
                <div className="d-duo-divider-line" />
                <div className="d-duo-divider-dot" />
                <div className="d-duo-divider-line r" />
              </div>
              <div className="d-duo-desc">
                사주의 깊이와 타로의 직관이<br/>하나의 질문에 함께 답합니다
              </div>
              <div className="d-duo-cta">연애 · 재회 · 궁합 · 돈 · 일  →</div>
            </div>
            <div className="d-duo-img right">
              <img src="/char-wolryeong.png" alt="월령" />
              <div className="d-duo-img-fade-r" />
            </div>
          </div>
        </div>
      </section>

      <footer className="d-footer">
        <div className="d-footer-inner">
          <div className="d-footer-brand">
            <div className="d-footer-logo-mark">命理天月</div>
            <div className="d-footer-brand-text">
              <div className="d-footer-brand-name">명리천월</div>
              <div className="d-footer-brand-meta">
                네 풀이사가 함께하는 운명 상담<br/>
                © 2026 · 풀이는 엔터테인먼트 목적입니다
              </div>
            </div>
          </div>
          <div className="d-footer-links">
            <span onClick={() => router.push("/replay")}>보관함</span>
            <span onClick={() => router.push("/terms")}>이용약관</span>
            <span onClick={() => router.push("/privacy")}>개인정보처리방침</span>
            <span onClick={() => router.push("/refund")}>환불정책</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
