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

  const navItems = [
    { id: "home", label: "홈", path: "/" },
    { id: "saju", label: "사주", path: "/saju" },
    { id: "tarot", label: "타로", path: "/tarot" },
    { id: "jami", label: "자미두수", path: "/jami" },
    { id: "duo", label: "자운×월령", path: "/duo" },
    { id: "dream", label: "꿈해몽", path: "/dream" },
    { id: "today", label: "오늘운세", path: "/today" },
    { id: "tojeong", label: "토정비결", path: "/tojeong" },
  ];

  return (
    <div className="d-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;700&family=Cinzel:wght@400;500;600&family=Diphylleia&display=swap');
        .d-app{width:100%;min-height:100dvh;background:
          radial-gradient(ellipse 80% 60% at 50% 0%,rgba(112,96,224,0.15),transparent 70%),
          radial-gradient(ellipse 60% 50% at 90% 80%,rgba(160,64,192,0.1),transparent 60%),
          #060410;
          color:#e0e6ff;display:flex;flex-direction:column;font-family:'Noto Serif KR',serif}
        .d-stars{position:fixed;inset:0;pointer-events:none;z-index:1;background-image:
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
          radial-gradient(1px 1px at 50% 95%,#b0c8ff,transparent);
          background-size:100% 100%;opacity:0.65;animation:d-twinkle 4s ease-in-out infinite}
        @keyframes d-twinkle{0%,100%{opacity:0.4}50%{opacity:0.85}}

        .d-header{position:sticky;top:0;width:100%;z-index:50;background:rgba(6,4,16,0.85);backdrop-filter:blur(14px);border-bottom:1px solid rgba(140,120,220,0.18)}
        .d-header-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:18px 32px}
        .d-logo{display:flex;flex-direction:column;cursor:pointer}
        .d-logo-name{font-family:'Diphylleia','Noto Serif KR',serif;color:#fff;font-size:26px;letter-spacing:6px;text-shadow:0 0 20px rgba(180,160,255,0.5);font-weight:500}
        .d-logo-sub{font-family:'Cinzel',sans-serif;font-size:9px;color:rgba(255,255,255,0.5);letter-spacing:4px;margin-top:3px}
        .d-nav{display:flex;align-items:center;gap:32px}
        .d-nav-item{font-family:'Noto Serif KR',serif;font-size:14px;color:rgba(255,255,255,0.75);cursor:pointer;letter-spacing:2px;transition:color 0.2s;position:relative;padding:4px 0}
        .d-nav-item:hover{color:#fff}
        .d-nav-item:hover::after{content:"";position:absolute;bottom:-2px;left:0;right:0;height:1px;background:linear-gradient(to right,transparent,rgba(180,160,255,0.7),transparent)}
        .d-login{padding:8px 22px;font-size:13px;border:1px solid rgba(180,160,255,0.4);color:rgba(255,255,255,0.85);border-radius:4px;background:transparent;cursor:pointer;font-family:'Noto Serif KR',serif;letter-spacing:2px;transition:all 0.15s}
        .d-login:hover{background:rgba(180,160,255,0.12);border-color:rgba(200,180,255,0.7)}

        .d-hero{position:relative;width:100%;height:520px;background:url('/bg.png') center/cover no-repeat;display:flex;align-items:center;justify-content:center;z-index:2;overflow:hidden}
        .d-hero-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(6,4,16,0.4) 0%,rgba(6,4,16,0.3) 50%,rgba(6,4,16,0.95) 100%)}
        .d-hero-text{position:relative;z-index:3;text-align:center;max-width:900px;padding:0 24px}
        .d-hero-tag{font-family:sans-serif;font-size:12px;letter-spacing:8px;color:rgba(220,200,255,0.85);margin-bottom:18px;text-shadow:0 1px 8px rgba(0,0,0,0.9)}
        .d-hero-title{font-size:52px;color:#fff;line-height:1.4;margin-bottom:16px;text-shadow:0 4px 24px rgba(0,0,0,0.95);letter-spacing:2px}
        .d-hero-title span{color:#a8c8ff;text-shadow:0 4px 24px rgba(0,0,0,0.95),0 0 30px rgba(140,180,255,0.5)}
        .d-hero-sub{font-family:sans-serif;font-size:16px;color:rgba(255,255,255,0.85);text-shadow:0 1px 8px rgba(0,0,0,0.95);letter-spacing:2px}

        .d-stats-section{position:relative;z-index:2;max-width:900px;margin:-50px auto 0;padding:0 32px}
        .d-stats{display:grid;grid-template-columns:1fr 1fr 1fr;background:rgba(20,16,40,0.85);backdrop-filter:blur(14px);border:1px solid rgba(140,120,220,0.25);border-radius:12px;padding:24px;box-shadow:0 12px 40px rgba(0,0,0,0.6)}
        .d-stat{text-align:center;padding:14px 8px}
        .d-stat+.d-stat{border-left:1px solid rgba(140,120,220,0.18)}
        .d-stat-num{font-family:'Cinzel','Noto Serif KR',serif;font-size:30px;color:#a8c8ff;letter-spacing:1px;margin-bottom:6px;text-shadow:0 0 14px rgba(140,180,255,0.4)}
        .d-stat-label{font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.6);letter-spacing:3px}

        .d-section{position:relative;z-index:2;max-width:1200px;margin:0 auto;padding:80px 32px}
        .d-sec-tag{font-family:sans-serif;font-size:12px;letter-spacing:8px;color:#9080d0;text-align:center;margin-bottom:10px}
        .d-sec-title{font-family:'Noto Serif KR',serif;font-size:32px;color:#fff;text-align:center;letter-spacing:4px;margin-bottom:14px;font-weight:500}
        .d-sec-sub{font-family:sans-serif;font-size:14px;color:rgba(255,255,255,0.55);text-align:center;letter-spacing:2px;margin-bottom:48px;line-height:1.7}

        .d-char-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
        .d-char-card{border-radius:14px;overflow:hidden;cursor:pointer;background:rgba(20,16,40,0.5);border:1px solid rgba(140,120,220,0.2);transition:all 0.25s}
        .d-char-card:hover{transform:translateY(-6px);border-color:rgba(180,160,255,0.55);box-shadow:0 16px 40px rgba(80,60,150,0.4)}
        .d-char-img{position:relative;aspect-ratio:3/4;overflow:hidden}
        .d-char-img img{width:100%;height:100%;object-fit:cover;object-position:top;display:block;transition:transform 0.4s}
        .d-char-card:hover .d-char-img img{transform:scale(1.05)}
        .d-char-img-fade{position:absolute;inset:0;background:linear-gradient(to bottom,transparent 55%,rgba(10,8,30,0.95) 100%)}
        .d-char-name-overlay{position:absolute;bottom:14px;left:0;right:0;text-align:center;z-index:2}
        .d-char-name{font-size:24px;color:#fff;letter-spacing:6px;text-shadow:0 2px 10px rgba(0,0,0,0.95);margin-bottom:2px}
        .d-char-hanja{font-size:11px;color:rgba(255,255,255,0.6);letter-spacing:5px}
        .d-char-body{padding:18px 18px 22px;background:rgba(8,6,22,0.95)}
        .d-char-role{font-family:sans-serif;font-size:11px;font-weight:700;letter-spacing:4px;margin-bottom:8px}
        .d-char-desc{font-family:sans-serif;font-size:12.5px;color:rgba(255,255,255,0.6);line-height:1.55;margin-bottom:12px;min-height:38px}
        .d-char-tag{font-family:sans-serif;font-size:10px;padding:4px 10px;border-radius:3px;display:inline-block;letter-spacing:1.5px}
        .d-tag-free{background:rgba(40,80,200,0.22);color:#90b0e0;border:1px solid rgba(60,100,220,0.3)}
        .d-tag-adult{background:rgba(160,30,80,0.22);color:#e08090;border:1px solid rgba(180,40,90,0.35)}

        .d-duo-section{position:relative;z-index:2;max-width:1100px;margin:0 auto;padding:0 32px 80px}
        .d-duo-card{position:relative;border-radius:18px;overflow:hidden;cursor:pointer;background:linear-gradient(135deg,rgba(40,30,80,0.85),rgba(80,30,100,0.85));border:1px solid rgba(180,140,240,0.4);transition:all 0.25s;display:grid;grid-template-columns:1fr 1.4fr 1fr;min-height:280px}
        .d-duo-card:hover{transform:translateY(-3px);border-color:rgba(220,180,255,0.7);box-shadow:0 16px 48px rgba(140,100,220,0.4)}
        .d-duo-bg{position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,rgba(180,140,240,0.18),transparent 60%);pointer-events:none}
        .d-duo-img{position:relative;overflow:hidden}
        .d-duo-img img{width:100%;height:100%;object-fit:cover;display:block}
        .d-duo-img.left img{object-position:right 20%}
        .d-duo-img.right img{object-position:left 20%}
        .d-duo-img-fade-l{position:absolute;top:0;right:0;width:50%;height:100%;background:linear-gradient(to right,transparent,rgba(45,20,75,0.92))}
        .d-duo-img-fade-r{position:absolute;top:0;left:0;width:50%;height:100%;background:linear-gradient(to left,transparent,rgba(60,20,80,0.92))}
        .d-duo-text{position:relative;z-index:2;padding:40px 24px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
        .d-duo-name{font-family:'Diphylleia','Noto Serif KR',serif;font-size:34px;color:#fff;letter-spacing:8px;margin-bottom:8px;text-shadow:0 0 24px rgba(220,180,255,0.6)}
        .d-duo-sub{font-family:sans-serif;font-size:11px;letter-spacing:6px;color:#c0a8e8;margin-bottom:24px}
        .d-duo-desc{font-family:sans-serif;font-size:14px;color:rgba(255,255,255,0.78);line-height:1.9;margin-bottom:20px}
        .d-duo-cta{font-family:sans-serif;font-size:12px;letter-spacing:3px;color:#e0c8ff;padding:12px 28px;border:1px solid rgba(220,180,255,0.4);border-radius:4px}

        .d-footer{position:relative;z-index:2;border-top:1px solid rgba(140,120,220,0.15);padding:32px;text-align:center;background:rgba(6,4,16,0.6)}
        .d-footer-links{display:flex;justify-content:center;gap:24px;margin-bottom:14px}
        .d-footer-links span{font-family:sans-serif;font-size:13px;color:rgba(180,160,240,0.7);cursor:pointer;letter-spacing:1px}
        .d-footer-links span:hover{color:#c0a8e8;text-decoration:underline}
        .d-footer-meta{font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:1px;line-height:1.7}
      `}</style>

      <div className="d-stars" />

      <header className="d-header">
        <div className="d-header-inner">
          <div className="d-logo" onClick={() => router.push("/")}>
            <div className="d-logo-name">命理天月</div>
            <div className="d-logo-sub">MYEONGRICHEONWOL</div>
          </div>
          <nav className="d-nav">
            {navItems.slice(1).map((n) => (
              <span key={n.id} className="d-nav-item" onClick={() => router.push(n.path)}>
                {n.label}
              </span>
            ))}
          </nav>
          <button className="d-login">로그인</button>
        </div>
      </header>

      <section className="d-hero">
        <div className="d-hero-overlay" />
        <div className="d-hero-text">
          <div className="d-hero-tag">사주 · 타로 · 자미두수 · 종합 풀이</div>
          <h1 className="d-hero-title">당신의 운명을<br/><span>하늘이 말해줍니다</span></h1>
          <p className="d-hero-sub">네 풀이사가 함께하는 운명 상담</p>
        </div>
      </section>

      <div className="d-stats-section">
        <div className="d-stats">
          <div className="d-stat"><div className="d-stat-num">24만+</div><div className="d-stat-label">누적 분석</div></div>
          <div className="d-stat"><div className="d-stat-num">4.9★</div><div className="d-stat-label">평균 만족도</div></div>
          <div className="d-stat"><div className="d-stat-num">정밀</div><div className="d-stat-label">심층 해석</div></div>
        </div>
      </div>

      <section className="d-section">
        <div className="d-sec-tag">✦  S E R V I C E  ✦</div>
        <div className="d-sec-title">하늘의 언어를 읽어드립니다</div>
        <div className="d-sec-sub">자운 · 월령 · 성연 · 밀서<br/>네 명의 풀이사가 그대의 운명을 함께 풀어드립니다</div>
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
        <div className="d-sec-tag">✦  合 一  ✦</div>
        <div className="d-sec-title" style={{ marginBottom: 32 }}>운명의 합주(合奏)</div>
        <div className="d-duo-card" onClick={() => router.push("/duo")}>
          <div className="d-duo-bg" />
          <div className="d-duo-img left">
            <img src="/char-jawun.png" alt="자운" />
            <div className="d-duo-img-fade-l" />
          </div>
          <div className="d-duo-text">
            <div className="d-duo-name">자운 × 월령</div>
            <div className="d-duo-sub">SAJU × TAROT</div>
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
      </section>

      <footer className="d-footer">
        <div className="d-footer-links">
          <span onClick={() => router.push("/terms")}>이용약관</span>
          <span onClick={() => router.push("/privacy")}>개인정보처리방침</span>
          <span onClick={() => router.push("/refund")}>환불정책</span>
          <span onClick={() => router.push("/replay")}>보관함</span>
        </div>
        <div className="d-footer-meta">© 2026 명리천월 命理天月 · 풀이는 엔터테인먼트 목적입니다</div>
      </footer>
    </div>
  );
}
