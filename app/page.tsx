"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function Home() {
  const [activeTab, setActiveTab] = useState("home");
  const router = useRouter();
  const characters = [
    { id: "saju", name: "자운", hanja: "紫雲", role: "사주", desc: "생년월일시로 사주팔자를 심층 풀이해 드립니다", tag: "기본 무료", adult: false, image: "/char-jawun.png", color: "#7060e0" },
    { id: "tarot", name: "월령", hanja: "月靈", role: "타로", desc: "다양한 스프레드로 현재와 미래를 읽어드립니다", tag: "1장 무료", adult: false, image: "/char-wolryeong.png", color: "#a040b0" },
    { id: "zodiac", name: "성하", hanja: "星霞", role: "별자리", desc: "오늘의 별자리 운세부터 월간 흐름까지", tag: "매일 무료", adult: false, image: "/char-seongha.png", color: "#2080d0" },
    { id: "milseo", name: "밀서", hanja: "密書", role: "밀서", desc: "은밀한 욕망과 운명의 기운", tag: "성인 전용", adult: true, image: "/char-milseo.png", color: "#c03060" },
  ];
  const tabs = [
    { id: "home", icon: "🏠", label: "홈", free: false, path: "/" },
    { id: "dream", icon: "🌙", label: "꿈해몽", free: true, path: "/dream" },
    { id: "today", icon: "💫", label: "오늘운세", free: true, path: "/today" },
    { id: "name", icon: "🔤", label: "이름풀이", free: true, path: "/namecheck" },
    { id: "replay", icon: "📦", label: "보관함", free: false, path: "/replay" },
  ];
  return (
    <>
      <style>{`
        @import url('https://cdn.jsdelivr.net/npm/@fontsource/nanum-myeongjo@4.5.0/400.css');
        @import url('https://cdn.jsdelivr.net/npm/@fontsource/im-fell-english@4.5.0/400.css');
        *{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;background:#000}
        body{font-family:'Nanum Myeongjo',Georgia,serif;display:flex;justify-content:center}
        .app{width:100%;max-width:448px;min-height:100dvh;background:#060410;display:flex;flex-direction:column}
        header{position:fixed;top:0;width:100%;max-width:448px;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:rgba(6,4,16,0.9);backdrop-filter:blur(10px);border-bottom:1px solid rgba(100,140,255,0.08)}
        .logo{font-family:'IM Fell English',serif;color:#fff;font-size:20px;letter-spacing:4px;text-shadow:0 0 20px rgba(100,160,255,0.6)}
        .logo-sub{font-family:sans-serif;font-size:8px;color:rgba(255,255,255,0.3);letter-spacing:2px;margin-top:2px}
        .btn-login{padding:6px 14px;font-size:10px;border:1px solid rgba(255,255,255,0.25);color:rgba(255,255,255,0.8);border-radius:3px;background:transparent;cursor:pointer;font-family:sans-serif}
        .content{flex:1;padding-top:60px;padding-bottom:70px;overflow-y:auto}
        .hero{position:relative;width:100%;height:300px;background-image:url('/bg.png');background-size:cover;background-position:center top;display:flex;align-items:flex-end;justify-content:center;padding-bottom:24px}
        .hero-ov{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,5,30,0.3) 0%,rgba(0,5,30,0.15) 40%,rgba(6,4,16,0.92) 100%)}
        .hero-txt{position:relative;z-index:2;text-align:center}
        .hero-tag{font-family:sans-serif;font-size:9px;color:rgba(255,255,255,0.6);letter-spacing:5px;margin-bottom:10px}
        .hero-h1{font-size:26px;color:#fff;line-height:1.35;margin-bottom:8px;text-shadow:0 2px 12px rgba(0,0,0,0.9)}
        .hero-h1 span{color:#80c0ff}
        .hero-sub{font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.7);text-shadow:0 1px 6px rgba(0,0,0,0.9)}
        .stats{display:flex;border-top:1px solid rgba(80,140,255,0.08);border-bottom:1px solid rgba(80,140,255,0.08)}
        .stat{flex:1;text-align:center;padding:14px 8px}
        .stat+.stat{border-left:1px solid rgba(80,140,255,0.08)}
        .sn{font-size:17px;color:#70b0ff}.sl{font-family:sans-serif;font-size:9px;color:#1a3050;margin-top:3px;letter-spacing:2px}
        .section{padding:24px 16px}
        .sec-tag{font-family:sans-serif;font-size:9px;color:#1a3060;letter-spacing:6px;margin-bottom:6px;text-align:center}
        .sec-title{font-size:15px;color:#3a6090;font-weight:400;letter-spacing:1px;text-align:center;margin-bottom:18px}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .card{border-radius:12px;overflow:hidden;cursor:pointer;transition:transform 0.2s}
        .card:hover{transform:scale(1.02)}.card:active{transform:scale(0.98)}
        .img-wrap{position:relative;aspect-ratio:3/4}
        .img-wrap img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
        .img-ov{position:absolute;inset:0;background:linear-gradient(to bottom,transparent 50%,rgba(0,0,0,0.85) 100%)}
        .img-info{position:absolute;bottom:0;left:0;right:0;padding:10px}
        .cname{font-size:16px;color:#fff;letter-spacing:2px;text-shadow:0 2px 6px rgba(0,0,0,0.9)}
        .chanja{font-size:10px;color:rgba(255,255,255,0.45);letter-spacing:3px}
        .cbot{background:rgba(8,5,22,0.95);border:1px solid rgba(60,90,180,0.15);border-top:none;border-radius:0 0 12px 12px;padding:10px 12px}
        .card.adult .cbot{border-color:rgba(160,40,80,0.15)}
        .crole{font-family:sans-serif;font-size:10px;font-weight:700;letter-spacing:3px;margin-bottom:4px}
        .cdesc{font-family:sans-serif;font-size:10px;color:#2a4060;line-height:1.5;margin-bottom:8px}
        .ctag{font-family:sans-serif;font-size:9px;padding:3px 8px;border-radius:2px;display:inline-block;letter-spacing:1px}
        .tf{background:rgba(40,80,200,0.2);color:#7090d0;border:1px solid rgba(60,100,220,0.25)}
        .ta{background:rgba(160,30,80,0.2);color:#d06080;border:1px solid rgba(180,40,90,0.3)}
        .bnav{position:fixed;bottom:0;width:100%;max-width:448px;display:flex;background:rgba(4,3,14,0.97);border-top:1px solid rgba(80,140,255,0.1);backdrop-filter:blur(10px);z-index:100}
        .ni{flex:1;display:flex;flex-direction:column;align-items:center;padding:8px 0 6px;cursor:pointer;position:relative}
        .ni-icon{font-size:16px;margin-bottom:2px}
        .ni-lbl{font-family:sans-serif;font-size:8px;color:#2a2a4a}
        .ni.active .ni-lbl{color:#70b0ff}
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
