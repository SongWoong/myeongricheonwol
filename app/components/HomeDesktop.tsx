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
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;700&family=Cinzel:wght@400;500&family=Diphylleia&display=swap');

        .d-app{width:100%;min-height:100dvh;color:#fff;font-family:'Noto Serif KR',serif;position:relative}

        /* 브라우저 전체 = 달빛 배경만 (보라 없음) */
        .d-bg{position:fixed;inset:0;z-index:-1;overflow:hidden}
        .d-bg img{width:100%;height:100%;object-fit:cover;display:block}
        .d-bg-tint{position:fixed;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(0,0,0,0.15) 0%,rgba(0,0,0,0.35) 50%,rgba(0,0,0,0.75) 100%);pointer-events:none}

        /* ───────── 헤더 바 ───────── */
        .d-header{position:fixed;top:0;left:0;right:0;z-index:100;height:70px;display:flex;align-items:center;background:rgba(0,0,0,0.35);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid rgba(255,255,255,0.08)}
        .d-header-inner{width:100%;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 56px;gap:48px}
        .d-logo{cursor:pointer;justify-self:start}
        .d-logo-mark{font-family:'Diphylleia','Noto Serif KR',serif;font-size:24px;color:#fff;letter-spacing:8px;font-weight:500;text-shadow:0 2px 12px rgba(0,0,0,0.8)}
        .d-nav{display:flex;align-items:center;gap:36px;justify-self:center}
        .d-nav-item{font-family:'Noto Serif KR',serif;font-size:14px;color:rgba(255,255,255,0.85);cursor:pointer;letter-spacing:3px;text-shadow:0 2px 8px rgba(0,0,0,0.9);transition:color 0.2s;padding:6px 0;position:relative}
        .d-nav-item:hover{color:#fff}
        .d-nav-item:hover::after{content:"";position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);width:20px;height:1px;background:rgba(255,255,255,0.8)}
        .d-login{justify-self:end;padding:9px 22px;font-size:13px;border:1px solid rgba(255,255,255,0.4);color:#fff;background:transparent;cursor:pointer;font-family:'Noto Serif KR',serif;letter-spacing:3px;transition:all 0.2s;text-shadow:0 2px 8px rgba(0,0,0,0.8)}
        .d-login:hover{background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.7)}

        /* ───────── 히어로 ───────── */
        .d-hero{position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:120px 60px 60px;text-align:center}
        .d-hero-tag{font-family:sans-serif;font-size:12px;letter-spacing:10px;color:rgba(255,255,255,0.85);margin-bottom:26px;text-shadow:0 2px 10px rgba(0,0,0,0.9)}
        .d-hero-title{font-family:'Noto Serif KR',serif;font-size:64px;color:#fff;line-height:1.4;letter-spacing:6px;margin-bottom:24px;text-shadow:0 4px 30px rgba(0,0,0,0.95);font-weight:500}
        .d-hero-title span{color:#a8c8ff;text-shadow:0 4px 30px rgba(0,0,0,0.95),0 0 40px rgba(140,180,255,0.6)}
        .d-hero-sub{font-family:sans-serif;font-size:17px;color:rgba(255,255,255,0.85);letter-spacing:4px;text-shadow:0 2px 10px rgba(0,0,0,0.95);margin-bottom:40px}
        .d-hero-cta{padding:14px 36px;background:rgba(255,255,255,0.1);backdrop-filter:blur(8px);color:#fff;border:1px solid rgba(255,255,255,0.5);font-family:'Noto Serif KR',serif;font-size:14px;letter-spacing:5px;cursor:pointer;transition:all 0.2s}
        .d-hero-cta:hover{background:rgba(255,255,255,0.2);border-color:rgba(255,255,255,0.8);transform:translateY(-2px)}

        /* ───────── 섹션 ───────── */
        .d-section{max-width:1400px;margin:0 auto;padding:100px 60px}
        .d-sec-tag{font-family:sans-serif;font-size:12px;letter-spacing:8px;color:rgba(255,255,255,0.7);text-align:center;margin-bottom:12px;text-shadow:0 2px 10px rgba(0,0,0,0.9)}
        .d-sec-title{font-family:'Noto Serif KR',serif;font-size:36px;color:#fff;text-align:center;letter-spacing:6px;margin-bottom:60px;font-weight:500;text-shadow:0 2px 16px rgba(0,0,0,0.9)}

        /* ───────── 캐릭터 4명 한 줄 ───────── */
        .d-char-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
        .d-char-card{position:relative;cursor:pointer;overflow:hidden;background:rgba(0,0,0,0.35);backdrop-filter:blur(8px);transition:all 0.3s}
        .d-char-card:hover{transform:translateY(-8px);box-shadow:0 20px 50px rgba(0,0,0,0.5)}
        .d-char-img{position:relative;aspect-ratio:3/4;overflow:hidden}
        .d-char-img img{width:100%;height:100%;object-fit:cover;object-position:top;display:block;transition:transform 0.5s}
        .d-char-card:hover .d-char-img img{transform:scale(1.05)}
        .d-char-img-fade{position:absolute;inset:0;background:linear-gradient(to bottom,transparent 50%,rgba(0,0,0,0.95));pointer-events:none}
        .d-char-name-overlay{position:absolute;bottom:18px;left:0;right:0;text-align:center;z-index:2}
        .d-char-name{font-size:28px;color:#fff;letter-spacing:8px;text-shadow:0 2px 12px rgba(0,0,0,0.95);margin-bottom:4px;font-weight:500}
        .d-char-hanja{font-size:11px;color:rgba(255,255,255,0.6);letter-spacing:6px}
        .d-char-body{padding:22px 20px 26px;text-align:center;background:rgba(0,0,0,0.5)}
        .d-char-role{font-family:sans-serif;font-size:11px;font-weight:700;letter-spacing:5px;margin-bottom:10px}
        .d-char-desc{font-family:sans-serif;font-size:12.5px;color:rgba(255,255,255,0.72);line-height:1.6;margin-bottom:14px;min-height:40px}
        .d-char-tag{font-family:sans-serif;font-size:10px;padding:5px 12px;display:inline-block;letter-spacing:2px}
        .d-tag-free{background:rgba(60,120,200,0.3);color:#a8d0ff;border:1px solid rgba(100,160,240,0.5)}
        .d-tag-adult{background:rgba(180,50,90,0.3);color:#ff9ab0;border:1px solid rgba(200,80,120,0.5)}

        /* ───────── 푸터 ───────── */
        .d-footer{padding:50px 60px 40px;background:rgba(0,0,0,0.45);backdrop-filter:blur(10px);border-top:1px solid rgba(255,255,255,0.08);text-align:center}
        .d-footer-brand{font-family:'Diphylleia','Noto Serif KR',serif;font-size:22px;color:#fff;letter-spacing:6px;margin-bottom:12px}
        .d-footer-links{display:flex;justify-content:center;gap:26px;margin-bottom:16px;flex-wrap:wrap}
        .d-footer-links span{font-family:sans-serif;font-size:13px;color:rgba(255,255,255,0.6);cursor:pointer;letter-spacing:2px}
        .d-footer-links span:hover{color:#fff}
        .d-footer-meta{font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:1px;line-height:1.7}
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
            <span className="d-nav-item" onClick={() => router.push("/duo")}>자운×월령</span>
            <span className="d-nav-item" onClick={() => router.push("/dream")}>꿈해몽</span>
            <span className="d-nav-item" onClick={() => router.push("/today")}>오늘운세</span>
            <span className="d-nav-item" onClick={() => router.push("/tojeong")}>토정비결</span>
          </nav>
          <button className="d-login">로그인</button>
        </div>
      </header>

      <section className="d-hero">
        <div>
          <div className="d-hero-tag">SAJU · TAROT · ZIWEI · DUO</div>
          <h1 className="d-hero-title">당신의 운명을<br/><span>하늘이 말해줍니다</span></h1>
          <p className="d-hero-sub">네 풀이사가 함께하는 운명 상담</p>
          <button className="d-hero-cta" onClick={() => router.push("/saju")}>풀이 시작하기 →</button>
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

      <footer className="d-footer">
        <div className="d-footer-brand">命理天月</div>
        <div className="d-footer-links">
          <span onClick={() => router.push("/replay")}>보관함</span>
          <span onClick={() => router.push("/terms")}>이용약관</span>
          <span onClick={() => router.push("/privacy")}>개인정보처리방침</span>
          <span onClick={() => router.push("/refund")}>환불정책</span>
        </div>
        <div className="d-footer-meta">© 2026 명리천월 · 풀이는 엔터테인먼트 목적입니다</div>
      </footer>
    </div>
  );
}
