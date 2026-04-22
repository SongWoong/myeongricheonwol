"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;700&family=Cinzel:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;background:#000}
        body{font-family:'Noto Serif KR',Georgia,serif;display:flex;justify-content:center}
        .app{position:relative;width:100%;max-width:448px;min-height:100dvh;background:
          radial-gradient(ellipse 80% 50% at 50% 0%,rgba(112,96,224,0.18),transparent 60%),
          radial-gradient(ellipse 60% 40% at 90% 60%,rgba(80,140,220,0.12),transparent 60%),
          radial-gradient(ellipse 50% 40% at 10% 80%,rgba(160,64,192,0.12),transparent 60%),
          #060410;
          display:flex;flex-direction:column;color:#e0e6ff;overflow:hidden}

        .stars{position:absolute;inset:0;pointer-events:none;z-index:1}
        .star{position:absolute;background:#fff;border-radius:50%;animation:tw 3s ease-in-out infinite}
        @keyframes tw{0%,100%{opacity:0.25;transform:scale(1)}50%{opacity:1;transform:scale(1.4)}}

        .glow{position:absolute;border-radius:50%;filter:blur(50px);pointer-events:none;z-index:1;background:rgba(112,96,224,0.3);width:280px;height:280px;top:35%;left:50%;transform:translateX(-50%);animation:pulse 4s ease-in-out infinite}
        @keyframes pulse{0%,100%{opacity:0.4;transform:translateX(-50%) scale(0.9)}50%{opacity:0.7;transform:translateX(-50%) scale(1.1)}}

        .content{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;position:relative;z-index:2;text-align:center}

        .tag{font-family:sans-serif;font-size:10px;letter-spacing:8px;color:#9080d0;margin-bottom:16px}
        .num{font-family:'Cinzel',serif;font-size:88px;color:#fff;letter-spacing:8px;font-weight:500;text-shadow:0 0 30px rgba(140,120,240,0.6),0 0 60px rgba(112,96,224,0.4);margin-bottom:8px;line-height:1}
        .num-sub{font-family:'Noto Serif KR',serif;font-size:14px;color:#a090e0;letter-spacing:3px;margin-bottom:36px}
        .title{font-size:18px;color:#fff;letter-spacing:2px;margin-bottom:14px;line-height:1.5}
        .desc{font-family:sans-serif;font-size:12px;color:rgba(255,255,255,0.55);line-height:1.8;margin-bottom:36px;letter-spacing:0.5px}
        .home-btn{display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#7060e0,#9040c0);color:#fff;border:none;border-radius:4px;font-family:'Noto Serif KR',serif;font-size:13px;letter-spacing:4px;cursor:pointer;text-decoration:none;box-shadow:0 4px 24px rgba(112,96,224,0.35);font-weight:500;transition:transform 0.15s}
        .home-btn:hover{transform:translateY(-2px)}

        .quote{margin-top:40px;font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.35);font-style:italic;line-height:1.7;letter-spacing:0.5px;max-width:280px}
      `}</style>
      <div className="app">
        <div className="stars" aria-hidden>
          {[
            {t:"8%",l:"15%",s:2,d:"0s"},{t:"12%",l:"78%",s:1.5,d:"0.8s"},
            {t:"20%",l:"45%",s:1,d:"1.5s"},{t:"28%",l:"88%",s:2,d:"0.3s"},
            {t:"35%",l:"22%",s:1.5,d:"2s"},{t:"42%",l:"62%",s:1,d:"1.2s"},
            {t:"75%",l:"8%",s:2,d:"0.6s"},{t:"82%",l:"82%",s:1,d:"1.8s"},
            {t:"88%",l:"38%",s:1.5,d:"0.4s"},{t:"92%",l:"72%",s:2,d:"2.2s"},
          ].map((st,i)=>(
            <span key={i} className="star" style={{top:st.t,left:st.l,width:st.s,height:st.s,animationDelay:st.d,boxShadow:`0 0 ${st.s*3}px #b0c8ff`}}/>
          ))}
        </div>
        <div className="glow" />
        <div className="content">
          <div className="tag">✦  L O S T  ✦</div>
          <div className="num">404</div>
          <div className="num-sub">不在</div>
          <div className="title">이 길은 하늘에도 없습니다</div>
          <div className="desc">
            찾으시는 페이지가 사라졌거나<br/>
            주소가 잘못 적혔습니다
          </div>
          <Link href="/" className="home-btn">← 명리천월로 돌아가기</Link>
          <div className="quote">
            &ldquo;길을 잃은 별도 결국 제자리로 돌아가는 법이지요&rdquo;
          </div>
        </div>
      </div>
    </>
  );
}
