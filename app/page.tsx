"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HomeDesktop } from "@/app/components/HomeDesktop";
export default function Home() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const [activeTab, setActiveTab] = useState("home");
  const router = useRouter();
  const characters = [
    { id: "saju", name: "자운", hanja: "紫雲", role: "사주", desc: "사주팔자로 운명을 풀이", tag: "기본 무료", adult: false, image: "/char-jawun.png", color: "#7060e0" },
    { id: "tarot", name: "월령", hanja: "月靈", role: "타로", desc: "카드로 현재와 미래를 보다", tag: "1장 무료", adult: false, image: "/char-wolryeong.png", color: "#a040b0" },
    { id: "jami", name: "성연", hanja: "星淵", role: "자미두수", desc: "별의 자리로 일생을 보다", tag: "기본 무료", adult: false, image: "/char-seongha.png", color: "#2080d0" },
    { id: "milseo", name: "밀서", hanja: "密書", role: "밀서", desc: "은밀한 욕망과 운명의 기운", tag: "성인 전용", adult: true, image: "/char-milseo.png", color: "#c03060" },
  ];
  const tabs = [
    { id: "home", icon: "🏠", label: "홈", free: false, path: "/" },
    { id: "dream", icon: "🌙", label: "꿈해몽", free: true, path: "/dream" },
    { id: "today", icon: "💫", label: "오늘운세", free: true, path: "/today" },
    { id: "tojeong", icon: "📜", label: "토정비결", free: true, path: "/tojeong" },
    { id: "replay", icon: "📦", label: "보관함", free: true, path: "/replay" },
  ];
  // 서버/초기 렌더 = null 상태: 빈 화면. 클라이언트에서 결정 후 하나만 렌더.
  if (isDesktop === null) return <div style={{background:"#060410",minHeight:"100dvh"}}/>;
  return isDesktop
    ? <HomeDesktop characters={characters} />
    : <MobileHome characters={characters} tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} router={router} />;
}

function MobileHome({ characters, tabs, activeTab, setActiveTab, router }: {
  characters: { id: string; name: string; hanja: string; role: string; desc: string; tag: string; adult: boolean; image: string; color: string }[];
  tabs: { id: string; icon: string; label: string; free: boolean; path: string }[];
  activeTab: string;
  setActiveTab: (s: string) => void;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;700&family=Cinzel:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;background:#000}
        body{font-family:'Noto Serif KR',Georgia,serif;display:flex;justify-content:center}
        .app{width:100%;max-width:448px;min-height:100dvh;background:#060410;display:flex;flex-direction:column}
        header{position:fixed;top:0;width:100%;max-width:448px;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:rgba(6,4,16,0.9);backdrop-filter:blur(10px);border-bottom:1px solid rgba(100,140,255,0.08)}
        .logo{font-family:'Cinzel','Noto Serif KR',serif;color:#fff;font-size:20px;letter-spacing:4px;text-shadow:0 0 20px rgba(100,160,255,0.6)}
        .logo-sub{font-family:sans-serif;font-size:9px;color:rgba(255,255,255,0.5);letter-spacing:2px;margin-top:2px}
        .btn-login{padding:6px 14px;font-size:10px;border:1px solid rgba(255,255,255,0.25);color:rgba(255,255,255,0.8);border-radius:3px;background:transparent;cursor:pointer;font-family:sans-serif}
        .content{flex:1;padding-top:60px;padding-bottom:70px;overflow-y:auto}
        .hero{position:relative;width:100%;height:300px;background-image:url('/bg.png');background-size:cover;background-position:center top;display:flex;align-items:flex-end;justify-content:center;padding-bottom:24px}
        .hero-ov{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,5,30,0.3) 0%,rgba(0,5,30,0.15) 40%,rgba(6,4,16,0.92) 100%)}
        .hero-txt{position:relative;z-index:2;text-align:center}
        .hero-tag{font-family:sans-serif;font-size:10px;color:rgba(255,255,255,0.78);letter-spacing:4px;margin-bottom:10px}
        .hero-h1{font-size:26px;color:#fff;line-height:1.35;margin-bottom:8px;text-shadow:0 2px 12px rgba(0,0,0,0.9)}
        .hero-h1 span{color:#80c0ff}
        .hero-sub{font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.7);text-shadow:0 1px 6px rgba(0,0,0,0.9)}
        .stats{display:flex;border-top:1px solid rgba(80,140,255,0.08);border-bottom:1px solid rgba(80,140,255,0.08)}
        .stat{flex:1;text-align:center;padding:14px 8px}
        .stat+.stat{border-left:1px solid rgba(80,140,255,0.08)}
        .sn{font-size:17px;color:#70b0ff}.sl{font-family:sans-serif;font-size:10px;color:#6a82b0;margin-top:3px;letter-spacing:2px}
        .section{padding:24px 16px}
        .sec-tag{font-family:sans-serif;font-size:10px;color:#6a8abc;letter-spacing:5px;margin-bottom:6px;text-align:center}
        .sec-title{font-size:15px;color:#a0b8dc;font-weight:400;letter-spacing:1px;text-align:center;margin-bottom:18px}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .card{border-radius:12px;overflow:hidden;cursor:pointer;transition:transform 0.2s}
        .card:hover{transform:scale(1.02)}.card:active{transform:scale(0.98)}
        .img-wrap{position:relative;aspect-ratio:3/4}
        .img-wrap img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
        .img-ov{position:absolute;inset:0;background:linear-gradient(to bottom,transparent 50%,rgba(0,0,0,0.85) 100%)}
        .img-info{position:absolute;bottom:0;left:0;right:0;padding:10px}
        .cname{font-size:16px;color:#fff;letter-spacing:2px;text-shadow:0 2px 6px rgba(0,0,0,0.9)}
        .chanja{font-size:10px;color:rgba(255,255,255,0.6);letter-spacing:3px}
        .cbot{background:rgba(8,5,22,0.95);border:1px solid rgba(60,90,180,0.15);border-top:none;border-radius:0 0 12px 12px;padding:10px 12px}
        .card.adult .cbot{border-color:rgba(160,40,80,0.15)}
        .crole{font-family:sans-serif;font-size:10px;font-weight:700;letter-spacing:3px;margin-bottom:4px}
        .cdesc{font-family:sans-serif;font-size:10.5px;color:#9ab0d0;line-height:1.5;margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .ctag{font-family:sans-serif;font-size:9px;padding:3px 8px;border-radius:2px;display:inline-block;letter-spacing:1px}
        .tf{background:rgba(40,80,200,0.2);color:#7090d0;border:1px solid rgba(60,100,220,0.25)}
        .ta{background:rgba(160,30,80,0.2);color:#d06080;border:1px solid rgba(180,40,90,0.3)}
        .duo-section{padding-top:6px}
        .duo-card{position:relative;border-radius:14px;overflow:hidden;cursor:pointer;background:linear-gradient(135deg,rgba(40,30,80,0.85),rgba(80,30,100,0.85));border:1px solid rgba(180,140,240,0.35);transition:all 0.2s}
        .duo-card:hover{transform:translateY(-2px);border-color:rgba(200,160,250,0.7);box-shadow:0 8px 32px rgba(140,100,220,0.35)}
        .duo-bg{position:absolute;inset:0;background:
          radial-gradient(circle at 20% 30%,rgba(112,96,224,0.4),transparent 55%),
          radial-gradient(circle at 80% 70%,rgba(180,100,180,0.35),transparent 55%);
          pointer-events:none;z-index:1}
        .duo-img-wrap{position:relative;display:flex;height:200px;overflow:hidden;z-index:2}
        .duo-img-half{flex:1;position:relative;overflow:hidden}
        .duo-img-half img{width:100%;height:100%;object-fit:cover;display:block}
        .duo-img-half.left img{object-position:right 15%}
        .duo-img-half.right img{object-position:left 15%}
        .duo-img-center-fade{position:absolute;top:0;left:50%;transform:translateX(-50%);width:30%;height:100%;background:linear-gradient(to right,transparent,rgba(45,20,75,0.8) 50%,transparent);pointer-events:none;z-index:3}
        .duo-img-bottom-fade{position:absolute;bottom:0;left:0;right:0;height:35%;background:linear-gradient(to bottom,transparent,rgba(20,10,40,0.9));pointer-events:none;z-index:3}
        .duo-x-overlay{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:'Noto Serif KR',serif;font-size:30px;color:#fff;text-shadow:0 0 22px rgba(220,180,255,0.9),0 0 44px rgba(180,140,240,0.6);font-weight:500;z-index:5;letter-spacing:0}
        .duo-text{position:relative;z-index:2;padding:14px 16px 18px;text-align:center}
        .duo-name{font-family:'Cinzel','Noto Serif KR',serif;font-size:18px;color:#fff;letter-spacing:4px;margin-bottom:12px;text-shadow:0 0 14px rgba(200,160,250,0.5);font-weight:500}
        .duo-sub{font-family:sans-serif;font-size:10px;color:rgba(255,255,255,0.7);letter-spacing:4px;margin-bottom:12px}
        .duo-desc-line{font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.72);line-height:1.7;margin-bottom:12px}
        .duo-cta{font-family:sans-serif;font-size:10px;letter-spacing:2px;color:#e0c8ff;padding-top:10px;border-top:1px solid rgba(255,255,255,0.13)}
        .hfoot{padding:24px 16px 28px;border-top:1px solid rgba(80,140,255,0.08);margin-top:10px;text-align:center}
        .hfoot-links{display:flex;justify-content:center;gap:14px;flex-wrap:wrap;margin-bottom:10px}
        .hfoot-links span{font-family:sans-serif;font-size:11px;color:rgba(160,180,240,0.7);cursor:pointer;letter-spacing:0.5px}
        .hfoot-links span:hover{color:#a0c0ff;text-decoration:underline}
        .hfoot-meta{font-family:sans-serif;font-size:10px;color:rgba(255,255,255,0.5);letter-spacing:1px;line-height:1.6}
        .bnav{position:fixed;bottom:0;width:100%;max-width:448px;display:flex;background:rgba(4,3,14,0.97);border-top:1px solid rgba(80,140,255,0.1);backdrop-filter:blur(10px);z-index:100}
        .ni{flex:1;display:flex;flex-direction:column;align-items:center;padding:8px 0 6px;cursor:pointer;position:relative}
        .ni-icon{font-size:18px;margin-bottom:4px;opacity:0.75}
        .ni-lbl{font-family:sans-serif;font-size:10px;color:#7a8ab0;letter-spacing:0.5px;font-weight:500}
        .ni.active .ni-icon{opacity:1}
        .ni.active .ni-lbl{color:#a0c4ff;text-shadow:0 0 8px rgba(120,180,255,0.5)}
        .fbadge{position:absolute;top:4px;right:6px;background:rgba(80,60,200,0.9);color:#fff;font-family:sans-serif;font-size:7px;font-weight:700;padding:1px 5px;border-radius:6px}
      `}</style>
      <div className="app">
        <header>
          <div><div className="logo">命理天月</div><div className="logo-sub">MYEONGRICHEONWOL</div></div>
          <button className="btn-login">로그인</button>
        </header>
        <div className="content">
          <div className="hero">
            <div className="hero-ov"/>
            <div className="hero-txt">
              <div className="hero-tag">사주 · 타로 · 별자리 종합</div>
              <h1 className="hero-h1">당신의 운명을<br/><span>하늘이 말해줍니다</span></h1>
              <p className="hero-sub">수천 년의 동양 지혜로 종합 분석해 드립니다</p>
            </div>
          </div>
          <div className="stats">
            <div className="stat"><div className="sn">24만+</div><div className="sl">누적 분석</div></div>
            <div className="stat"><div className="sn">4.9★</div><div className="sl">평균 만족도</div></div>
            <div className="stat"><div className="sn">정밀</div><div className="sl">심층 해석</div></div>
          </div>
          <div className="section">
            <div className="sec-tag">✦  S E R V I C E  ✦</div>
            <div className="sec-title">하늘의 언어를 읽어드립니다</div>
            <div className="grid">
              {characters.map((c) => (
                <div key={c.id} className={`card ${c.adult?"adult":""}`} onClick={() => router.push(`/${c.id}`)}>
                  <div className="img-wrap">
                    <img src={c.image} alt={c.name}/>
                    <div className="img-ov"/>
                    <div className="img-info">
                      <div className="cname">{c.name}</div>
                      <div className="chanja">{c.hanja}</div>
                    </div>
                  </div>
                  <div className="cbot">
                    <div className="crole" style={{color:c.color}}>{c.role}</div>
                    <div className="cdesc">{c.desc}</div>
                    <span className={`ctag ${c.adult?"ta":"tf"}`}>{c.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="section duo-section">
            <div className="sec-tag">✦  合 一  ✦</div>
            <div className="sec-title">운명의 합주(合奏)</div>
            <div className="duo-card" onClick={() => router.push("/duo")}>
              <div className="duo-bg"/>
              <div className="duo-img-wrap">
                <div className="duo-img-half left"><img src="/char-jawun.png" alt="자운"/></div>
                <div className="duo-img-half right"><img src="/char-wolryeong.png" alt="월령"/></div>
                <div className="duo-img-center-fade"/>
                <div className="duo-img-bottom-fade"/>
              </div>
              <div className="duo-text">
                <div className="duo-name">자운 × 월령</div>
                <div className="duo-desc-line">사주의 깊이와 타로의 직관이<br/>하나의 질문에 함께 답합니다</div>
                <div className="duo-cta">연애 · 재회 · 궁합 · 돈 · 일  →</div>
              </div>
            </div>
          </div>
          <div className="hfoot">
            <div className="hfoot-links">
              <span onClick={() => router.push("/terms")}>이용약관</span>
              <span onClick={() => router.push("/privacy")}>개인정보처리방침</span>
              <span onClick={() => router.push("/refund")}>환불정책</span>
            </div>
            <div className="hfoot-meta">© 2026 명리천월 命理天月 · 풀이는 엔터테인먼트 목적입니다</div>
          </div>
        </div>
        <div className="bnav">
          {tabs.map((t) => (
            <div key={t.id} className={`ni ${activeTab===t.id?"active":""}`} onClick={() => {setActiveTab(t.id);router.push(t.path)}}>
              {t.free && <span className="fbadge">FREE</span>}
              <div className="ni-icon">{t.icon}</div>
              <div className="ni-lbl">{t.label}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
