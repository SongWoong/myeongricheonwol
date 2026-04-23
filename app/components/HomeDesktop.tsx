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
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;700&family=Cinzel:wght@400;500;600&family=Diphylleia&display=swap');

        .d-app{width:100%;min-height:100dvh;background:#04030a;color:#e0e6ff;font-family:'Noto Serif KR',serif;position:relative;overflow-x:hidden}

        /* 전체 화면 별빛 배경 */
        .d-bg-stars{position:fixed;inset:0;pointer-events:none;z-index:0;background-image:
          radial-gradient(2px 2px at 5% 8%,#fff,transparent),
          radial-gradient(1.5px 1.5px at 12% 22%,#b0c8ff,transparent),
          radial-gradient(2px 2px at 18% 48%,#fff,transparent),
          radial-gradient(1px 1px at 25% 70%,#d0b0ff,transparent),
          radial-gradient(2px 2px at 6% 88%,#c0a0ff,transparent),
          radial-gradient(1.5px 1.5px at 88% 8%,#fff,transparent),
          radial-gradient(2px 2px at 92% 30%,#b0c8ff,transparent),
          radial-gradient(1px 1px at 95% 60%,#fff,transparent),
          radial-gradient(2px 2px at 90% 80%,#d0b0ff,transparent),
          radial-gradient(1.5px 1.5px at 96% 92%,#c0a0ff,transparent),
          radial-gradient(1.5px 1.5px at 50% 5%,#fff,transparent),
          radial-gradient(1px 1px at 50% 95%,#b0c8ff,transparent),
          radial-gradient(1.5px 1.5px at 38% 35%,#fff,transparent),
          radial-gradient(1px 1px at 65% 60%,#d0b0ff,transparent),
          radial-gradient(2px 2px at 78% 18%,#fff,transparent);
          background-size:100% 100%;opacity:0.55;animation:d-twinkle 4s ease-in-out infinite}
        @keyframes d-twinkle{0%,100%{opacity:0.4}50%{opacity:0.8}}

        /* 양옆 거대 한자 장식 (배경) */
        .d-bg-hanja-l,.d-bg-hanja-r{position:fixed;top:0;height:100vh;width:25vw;display:flex;align-items:center;justify-content:center;font-family:'Noto Serif KR',serif;font-size:280px;color:rgba(180,160,255,0.025);font-weight:500;letter-spacing:60px;writing-mode:vertical-rl;pointer-events:none;z-index:1}
        .d-bg-hanja-l{left:0}
        .d-bg-hanja-r{right:0}
        @media (max-width:1400px){.d-bg-hanja-l,.d-bg-hanja-r{font-size:200px;width:18vw}}
        @media (max-width:1200px){.d-bg-hanja-l,.d-bg-hanja-r{display:none}}

        /* 글로우 구체 (배경) */
        .d-bg-glow1,.d-bg-glow2{position:fixed;border-radius:50%;filter:blur(80px);pointer-events:none;z-index:1;animation:d-float 12s ease-in-out infinite}
        .d-bg-glow1{top:5%;left:8%;width:400px;height:400px;background:rgba(112,96,224,0.18)}
        .d-bg-glow2{bottom:10%;right:10%;width:480px;height:480px;background:rgba(160,64,192,0.14);animation-delay:5s}
        @keyframes d-float{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-40px)}}

        /* 헤더 */
        .d-header{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(4,3,10,0.55);backdrop-filter:blur(20px);border-bottom:1px solid rgba(140,120,220,0.12)}
        .d-header-inner{max-width:1600px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:20px 56px}
        .d-logo{display:flex;flex-direction:column;cursor:pointer}
        .d-logo-name{font-family:'Diphylleia','Noto Serif KR',serif;color:#fff;font-size:28px;letter-spacing:8px;text-shadow:0 0 24px rgba(180,160,255,0.5);font-weight:500;line-height:1}
        .d-logo-sub{font-family:'Cinzel',sans-serif;font-size:9px;color:rgba(255,255,255,0.45);letter-spacing:5px;margin-top:5px}
        .d-nav{display:flex;align-items:center;gap:38px}
        .d-nav-item{font-family:'Noto Serif KR',serif;font-size:14px;color:rgba(255,255,255,0.7);cursor:pointer;letter-spacing:3px;transition:color 0.2s;position:relative;padding:6px 0}
        .d-nav-item:hover{color:#fff}
        .d-nav-item:hover::after{content:"";position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);width:30px;height:1px;background:rgba(220,200,255,0.7)}
        .d-login{padding:10px 26px;font-size:13px;border:1px solid rgba(180,160,255,0.4);color:rgba(255,255,255,0.85);border-radius:2px;background:transparent;cursor:pointer;font-family:'Noto Serif KR',serif;letter-spacing:3px;transition:all 0.15s}
        .d-login:hover{background:rgba(180,160,255,0.12);border-color:rgba(200,180,255,0.7)}

        /* 풀스크린 히어로 */
        .d-hero{position:relative;width:100%;height:100vh;min-height:700px;display:flex;align-items:center;justify-content:center;z-index:2;overflow:hidden}
        .d-hero-bg{position:absolute;inset:0;background:url('/bg.png') center/cover no-repeat;z-index:1}
        .d-hero-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(4,3,10,0.5) 0%,rgba(4,3,10,0.35) 40%,rgba(4,3,10,0.85) 100%);z-index:2}
        .d-hero-side-l,.d-hero-side-r{position:absolute;top:0;bottom:0;width:1px;background:linear-gradient(to bottom,transparent,rgba(180,160,255,0.4) 30%,rgba(180,160,255,0.4) 70%,transparent);z-index:3}
        .d-hero-side-l{left:80px}
        .d-hero-side-r{right:80px}
        .d-hero-corner{position:absolute;width:80px;height:80px;border:1px solid rgba(180,160,255,0.4);z-index:3}
        .d-hero-corner.tl{top:60px;left:60px;border-right:none;border-bottom:none}
        .d-hero-corner.tr{top:60px;right:60px;border-left:none;border-bottom:none}
        .d-hero-corner.bl{bottom:60px;left:60px;border-right:none;border-top:none}
        .d-hero-corner.br{bottom:60px;right:60px;border-left:none;border-top:none}
        .d-hero-text{position:relative;z-index:4;text-align:center;padding:0 60px}
        .d-hero-mark{font-family:'Diphylleia','Noto Serif KR',serif;font-size:80px;color:rgba(220,200,255,0.5);letter-spacing:32px;margin-bottom:30px;text-shadow:0 0 30px rgba(180,160,255,0.3);animation:d-mark-fade 6s ease-in-out infinite;font-weight:500}
        @keyframes d-mark-fade{0%,100%{opacity:0.5}50%{opacity:0.85}}
        .d-hero-tag{font-family:sans-serif;font-size:13px;letter-spacing:10px;color:rgba(220,200,255,0.85);margin-bottom:24px;text-shadow:0 1px 8px rgba(0,0,0,0.95)}
        .d-hero-title{font-size:64px;color:#fff;line-height:1.4;margin-bottom:24px;text-shadow:0 4px 30px rgba(0,0,0,0.95);letter-spacing:6px;font-weight:400}
        .d-hero-title span{color:#a8c8ff;text-shadow:0 4px 30px rgba(0,0,0,0.95),0 0 40px rgba(140,180,255,0.6)}
        .d-hero-sub{font-family:sans-serif;font-size:18px;color:rgba(255,255,255,0.85);text-shadow:0 1px 10px rgba(0,0,0,0.95);letter-spacing:4px;margin-bottom:50px}
        .d-hero-scroll{position:absolute;bottom:50px;left:50%;transform:translateX(-50%);font-family:sans-serif;font-size:11px;letter-spacing:4px;color:rgba(255,255,255,0.55);z-index:4;animation:d-scroll-bounce 2s ease-in-out infinite}
        @keyframes d-scroll-bounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(8px)}}

        /* 통계 - 히어로 아래 띠 */
        .d-stats-band{position:relative;z-index:3;background:linear-gradient(to right,transparent,rgba(20,16,40,0.7) 20%,rgba(20,16,40,0.7) 80%,transparent);border-top:1px solid rgba(140,120,220,0.15);border-bottom:1px solid rgba(140,120,220,0.15);padding:36px 0}
        .d-stats{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr 1fr;padding:0 56px}
        .d-stat{text-align:center;padding:0 24px;position:relative}
        .d-stat+.d-stat::before{content:"";position:absolute;left:0;top:10%;bottom:10%;width:1px;background:linear-gradient(to bottom,transparent,rgba(140,120,220,0.3),transparent)}
        .d-stat-num{font-family:'Cinzel','Noto Serif KR',serif;font-size:36px;color:#a8c8ff;letter-spacing:1px;margin-bottom:8px;text-shadow:0 0 18px rgba(140,180,255,0.4)}
        .d-stat-label{font-family:sans-serif;font-size:12px;color:rgba(255,255,255,0.6);letter-spacing:5px}

        /* 캐릭터 섹션 */
        .d-section{position:relative;z-index:3;max-width:1500px;margin:0 auto;padding:140px 60px}
        .d-sec-frame{position:relative;text-align:center;margin-bottom:80px}
        .d-sec-frame::before,.d-sec-frame::after{content:"";position:absolute;top:50%;width:80px;height:1px;background:linear-gradient(to right,transparent,rgba(180,160,255,0.5),transparent)}
        .d-sec-frame::before{left:calc(50% - 240px);transform:translateY(-50%)}
        .d-sec-frame::after{right:calc(50% - 240px);transform:translateY(-50%)}
        .d-sec-tag{font-family:sans-serif;font-size:13px;letter-spacing:10px;color:#a090e0;margin-bottom:14px}
        .d-sec-title{font-family:'Noto Serif KR',serif;font-size:42px;color:#fff;letter-spacing:8px;margin-bottom:18px;font-weight:500;text-shadow:0 0 24px rgba(180,160,255,0.25)}
        .d-sec-sub{font-family:sans-serif;font-size:15px;color:rgba(255,255,255,0.55);letter-spacing:3px;line-height:1.9}

        .d-char-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:32px}
        .d-char-card{position:relative;border-radius:0;overflow:hidden;cursor:pointer;background:rgba(8,6,22,0.7);border:1px solid rgba(140,120,220,0.18);transition:all 0.35s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column}
        .d-char-card::before{content:"";position:absolute;inset:0;border:1px solid transparent;pointer-events:none;transition:border-color 0.35s;z-index:5}
        .d-char-card:hover{transform:translateY(-10px);box-shadow:0 24px 60px rgba(80,60,150,0.45)}
        .d-char-card:hover::before{border-color:rgba(220,200,255,0.45);inset:6px}
        .d-char-img{position:relative;aspect-ratio:3/4;overflow:hidden}
        .d-char-img img{width:100%;height:100%;object-fit:cover;object-position:top;display:block;transition:transform 0.6s}
        .d-char-card:hover .d-char-img img{transform:scale(1.06)}
        .d-char-img-fade{position:absolute;inset:0;background:linear-gradient(to bottom,transparent 50%,rgba(8,6,22,0.97) 100%);pointer-events:none}
        .d-char-name-overlay{position:absolute;bottom:18px;left:0;right:0;text-align:center;z-index:2;padding:0 16px}
        .d-char-name{font-family:'Noto Serif KR',serif;font-size:28px;color:#fff;letter-spacing:8px;text-shadow:0 2px 12px rgba(0,0,0,0.95);margin-bottom:4px;font-weight:500}
        .d-char-hanja{font-size:11px;color:rgba(255,255,255,0.55);letter-spacing:6px}
        .d-char-body{padding:22px 22px 26px;text-align:center;border-top:1px solid rgba(140,120,220,0.15)}
        .d-char-role{font-family:sans-serif;font-size:11px;font-weight:700;letter-spacing:5px;margin-bottom:10px}
        .d-char-desc{font-family:sans-serif;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.6;margin-bottom:14px;min-height:42px}
        .d-char-tag{font-family:sans-serif;font-size:10px;padding:5px 12px;border-radius:2px;display:inline-block;letter-spacing:2px}
        .d-tag-free{background:rgba(40,80,200,0.22);color:#90b0e0;border:1px solid rgba(60,100,220,0.3)}
        .d-tag-adult{background:rgba(160,30,80,0.22);color:#e08090;border:1px solid rgba(180,40,90,0.35)}

        /* 듀오 섹션 — 풀와이드 */
        .d-duo-section{position:relative;z-index:3;width:100%;padding:80px 0 140px}
        .d-duo-inner{max-width:1500px;margin:0 auto;padding:0 60px}
        .d-duo-card{position:relative;border-radius:0;overflow:hidden;cursor:pointer;background:linear-gradient(135deg,rgba(40,30,80,0.85),rgba(80,30,100,0.85));border:1px solid rgba(180,140,240,0.4);transition:all 0.3s;display:grid;grid-template-columns:1fr 1.6fr 1fr;min-height:380px}
        .d-duo-card::before{content:"";position:absolute;inset:0;border:1px solid transparent;pointer-events:none;transition:all 0.3s;z-index:5}
        .d-duo-card:hover{transform:translateY(-4px);box-shadow:0 24px 64px rgba(140,100,220,0.45)}
        .d-duo-card:hover::before{border-color:rgba(220,180,255,0.5);inset:8px}
        .d-duo-bg{position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,rgba(180,140,240,0.2),transparent 60%);pointer-events:none}
        .d-duo-img{position:relative;overflow:hidden}
        .d-duo-img img{width:100%;height:100%;object-fit:cover;display:block}
        .d-duo-img.left img{object-position:right 18%}
        .d-duo-img.right img{object-position:left 18%}
        .d-duo-img-fade-l{position:absolute;top:0;right:0;width:50%;height:100%;background:linear-gradient(to right,transparent,rgba(45,20,75,0.92))}
        .d-duo-img-fade-r{position:absolute;top:0;left:0;width:50%;height:100%;background:linear-gradient(to left,transparent,rgba(60,20,80,0.92))}
        .d-duo-text{position:relative;z-index:2;padding:60px 32px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
        .d-duo-mark{font-family:sans-serif;font-size:11px;letter-spacing:8px;color:#c0a8e8;margin-bottom:14px}
        .d-duo-name{font-family:'Diphylleia','Noto Serif KR',serif;font-size:46px;color:#fff;letter-spacing:12px;margin-bottom:18px;text-shadow:0 0 30px rgba(220,180,255,0.5);font-weight:500}
        .d-duo-divider{width:60px;height:1px;background:linear-gradient(to right,transparent,rgba(220,180,255,0.7),transparent);margin-bottom:22px}
        .d-duo-desc{font-family:sans-serif;font-size:15px;color:rgba(255,255,255,0.78);line-height:2;margin-bottom:28px;letter-spacing:1px}
        .d-duo-cta{font-family:sans-serif;font-size:12px;letter-spacing:4px;color:#e0c8ff;padding:14px 32px;border:1px solid rgba(220,180,255,0.5);border-radius:2px;transition:all 0.2s}
        .d-duo-card:hover .d-duo-cta{background:rgba(220,180,255,0.12);border-color:rgba(240,200,255,0.7)}

        /* 푸터 */
        .d-footer{position:relative;z-index:3;border-top:1px solid rgba(140,120,220,0.12);padding:60px 60px 50px;background:rgba(4,3,10,0.6)}
        .d-footer-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr auto;gap:40px;align-items:center}
        .d-footer-brand{}
        .d-footer-brand-name{font-family:'Diphylleia','Noto Serif KR',serif;font-size:22px;color:#fff;letter-spacing:6px;margin-bottom:8px;font-weight:500}
        .d-footer-brand-meta{font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.45);letter-spacing:1.5px;line-height:1.8}
        .d-footer-links{display:flex;gap:24px;flex-wrap:wrap;justify-content:flex-end}
        .d-footer-links span{font-family:sans-serif;font-size:13px;color:rgba(180,160,240,0.7);cursor:pointer;letter-spacing:2px}
        .d-footer-links span:hover{color:#c0a8e8;text-decoration:underline}
      `}</style>

      <div className="d-bg-stars" />
      <div className="d-bg-glow1" />
      <div className="d-bg-glow2" />
      <div className="d-bg-hanja-l">命理</div>
      <div className="d-bg-hanja-r">天月</div>

      <header className="d-header">
        <div className="d-header-inner">
          <div className="d-logo" onClick={() => router.push("/")}>
            <div className="d-logo-name">命理天月</div>
            <div className="d-logo-sub">MYEONGRICHEONWOL</div>
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
        <div className="d-hero-bg" />
        <div className="d-hero-overlay" />
        <div className="d-hero-side-l" />
        <div className="d-hero-side-r" />
        <div className="d-hero-corner tl" />
        <div className="d-hero-corner tr" />
        <div className="d-hero-corner bl" />
        <div className="d-hero-corner br" />
        <div className="d-hero-text">
          <div className="d-hero-mark">命 理 天 月</div>
          <div className="d-hero-tag">SAJU · TAROT · ZIWEI · DUO</div>
          <h1 className="d-hero-title">당신의 운명을<br/><span>하늘이 말해줍니다</span></h1>
          <p className="d-hero-sub">네 풀이사가 함께하는 운명 상담</p>
        </div>
        <div className="d-hero-scroll">SCROLL ↓</div>
      </section>

      <div className="d-stats-band">
        <div className="d-stats">
          <div className="d-stat"><div className="d-stat-num">24만+</div><div className="d-stat-label">누적 분석</div></div>
          <div className="d-stat"><div className="d-stat-num">4.9★</div><div className="d-stat-label">평균 만족도</div></div>
          <div className="d-stat"><div className="d-stat-num">정밀</div><div className="d-stat-label">심층 해석</div></div>
        </div>
      </div>

      <section className="d-section">
        <div className="d-sec-frame">
          <div className="d-sec-tag">✦  S E R V I C E  ✦</div>
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
            <div className="d-sec-tag">✦  合 一  ✦</div>
            <div className="d-sec-title">운명의 합주(合奏)</div>
          </div>
          <div className="d-duo-card" onClick={() => router.push("/duo")}>
            <div className="d-duo-bg" />
            <div className="d-duo-img left">
              <img src="/char-jawun.png" alt="자운" />
              <div className="d-duo-img-fade-l" />
            </div>
            <div className="d-duo-text">
              <div className="d-duo-mark">✦  D U O  ✦</div>
              <div className="d-duo-name">자운 × 월령</div>
              <div className="d-duo-divider" />
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
            <div className="d-footer-brand-name">命理天月</div>
            <div className="d-footer-brand-meta">
              네 풀이사가 함께하는 운명 상담<br/>
              © 2026 명리천월 · 풀이는 엔터테인먼트 목적입니다
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
