"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LIMITS, checkLimit, recordUsage } from "@/app/lib/limits";
import { ShareButtons } from "@/app/components/ShareButtons";

type Stage = "form" | "loading" | "result";

export default function DreamPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("form");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [dream, setDream] = useState("");
  const [limit, setLimit] = useState(checkLimit(LIMITS.dream));

  useEffect(() => { setLimit(checkLimit(LIMITS.dream)); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dream.trim().length < 5) {
      setError("꿈 내용을 조금 더 자세히 적어주세요");
      return;
    }
    const fresh = checkLimit(LIMITS.dream);
    if (!fresh.allowed) {
      setLimit(fresh);
      setError(`오늘 무료 풀이를 모두 사용했습니다 (${fresh.used}/${fresh.max}). ${fresh.resetText}`);
      return;
    }
    setError("");
    setStage("loading");
    try {
      const res = await fetch("/api/dream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dream }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `서버 오류 (${res.status})`);
      setResult(data.result || "");
      recordUsage(LIMITS.dream);
      setLimit(checkLimit(LIMITS.dream));
      setStage("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
      setStage("form");
    }
  };

  const reset = () => { setStage("form"); setResult(""); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;700&family=Cinzel:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;background:#000}
        body{font-family:'Noto Serif KR',Georgia,serif;display:flex;justify-content:center}
        .app{position:relative;width:100%;max-width:448px;min-height:100dvh;background:
          radial-gradient(ellipse 80% 50% at 50% 0%,rgba(140,100,200,0.22),transparent 60%),
          radial-gradient(ellipse 60% 40% at 90% 50%,rgba(100,80,180,0.16),transparent 60%),
          radial-gradient(ellipse 50% 40% at 10% 85%,rgba(80,60,160,0.16),transparent 60%),
          #0a0618;
          display:flex;flex-direction:column;color:#e8e0ff}
        .stars{position:absolute;inset:0;pointer-events:none;z-index:1;overflow:hidden}
        .star{position:absolute;background:#fff;border-radius:50%;animation:tw 3s ease-in-out infinite}
        @keyframes tw{0%,100%{opacity:0.25;transform:scale(1)}50%{opacity:1;transform:scale(1.4)}}
        @keyframes fl{0%,100%{transform:translate(0,0)}50%{transform:translate(8px,-12px)}}
        .glow{position:absolute;border-radius:50%;filter:blur(40px);pointer-events:none;z-index:1;animation:fl 10s ease-in-out infinite}
        header,.content{position:relative;z-index:3}
        header{position:fixed;top:0;width:100%;max-width:448px;z-index:100;display:flex;align-items:center;gap:12px;padding:14px 20px;background:rgba(10,6,24,0.9);backdrop-filter:blur(10px);border-bottom:1px solid rgba(140,100,200,0.12)}
        .back{background:transparent;border:none;color:rgba(255,255,255,0.7);font-size:18px;cursor:pointer;padding:0 4px}
        .h-title{font-family:'Cinzel','Noto Serif KR',serif;color:#fff;font-size:16px;letter-spacing:3px;text-shadow:0 0 20px rgba(180,140,240,0.5);font-weight:500}
        .h-sub{font-family:sans-serif;font-size:8px;color:rgba(255,255,255,0.35);letter-spacing:2px;margin-top:2px}
        .content{flex:1;padding:74px 20px 40px;overflow-y:auto}
        .hero{text-align:center;margin-bottom:24px}
        .moon{width:100px;height:100px;margin:0 auto 16px;border-radius:50%;background:radial-gradient(circle at 65% 35%,#1a0828 30%,transparent 31%),radial-gradient(circle at 35% 35%,#e8d8ff,#9080d0 50%,#5040a0 90%);box-shadow:0 0 40px rgba(160,120,240,0.4),inset -6px -8px 16px rgba(0,0,0,0.3);position:relative}
        .hero-tag{font-family:sans-serif;font-size:10px;letter-spacing:6px;color:#a890d0;margin-bottom:6px}
        .hero-title{font-size:18px;color:#fff;letter-spacing:3px;margin-bottom:8px}
        .hero-desc{font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.55);line-height:1.7}
        form{display:flex;flex-direction:column;gap:16px}
        label{font-family:sans-serif;font-size:12px;letter-spacing:2px;color:#b8a0e0;margin-bottom:8px;display:block;font-weight:500}
        textarea{width:100%;padding:14px;background:rgba(14,8,32,0.7);border:1px solid rgba(120,80,200,0.25);border-radius:4px;color:#e8e0ff;font-family:inherit;font-size:13px;outline:none;transition:border-color 0.2s;resize:vertical;min-height:140px;line-height:1.7}
        textarea:focus{border-color:rgba(160,120,240,0.6)}
        textarea::placeholder{color:rgba(255,255,255,0.25);line-height:1.7}
        .counter{font-family:sans-serif;font-size:10px;color:rgba(255,255,255,0.35);text-align:right;margin-top:4px}
        .examples{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
        .ex{font-family:sans-serif;font-size:10px;padding:5px 10px;background:rgba(120,80,200,0.12);border:1px solid rgba(140,100,220,0.25);color:#c0a8e0;border-radius:14px;cursor:pointer;transition:all 0.15s}
        .ex:hover{background:rgba(140,100,220,0.22);color:#fff}
        .err{font-family:sans-serif;font-size:11px;color:#ff7090;padding:10px;background:rgba(200,40,80,0.1);border:1px solid rgba(200,60,100,0.3);border-radius:4px}
        .submit{margin-top:10px;padding:14px;background:linear-gradient(135deg,#7050c0,#a060d0);color:#fff;border:none;border-radius:4px;font-family:'Noto Serif KR',serif;font-size:14px;letter-spacing:4px;cursor:pointer;box-shadow:0 4px 20px rgba(140,100,220,0.3);transition:transform 0.1s;font-weight:500}
        .submit:hover{transform:translateY(-1px)}
        .loading{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center}
        .loading-ring{width:70px;height:70px;border:2px solid rgba(160,120,240,0.15);border-top-color:#c0a0ff;border-radius:50%;animation:spin 1.2s linear infinite;margin-bottom:24px}
        @keyframes spin{to{transform:rotate(360deg)}}
        .loading-msg{font-size:14px;color:#d8c0ff;letter-spacing:3px;margin-bottom:8px}
        .loading-sub{font-family:sans-serif;font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:2px}
        .result-head{text-align:center;margin-bottom:20px;padding-bottom:18px;border-bottom:1px solid rgba(120,80,200,0.18)}
        .result-tag{font-family:sans-serif;font-size:9px;letter-spacing:5px;color:#a890d0;margin-bottom:6px}
        .result-name{font-size:18px;color:#fff;letter-spacing:2px}
        .result-quote{font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.5);margin-top:8px;font-style:italic;line-height:1.6;padding:10px 16px;background:rgba(120,80,200,0.08);border-left:2px solid rgba(160,120,240,0.4);text-align:left;border-radius:2px}
        .result-body{font-size:13px;line-height:1.9;color:#e0d8f5;white-space:pre-wrap;word-break:keep-all}
        .again{margin-top:28px;padding:12px;width:100%;background:transparent;border:1px solid rgba(160,120,240,0.4);color:#c0a8e0;border-radius:4px;font-family:'Noto Serif KR',serif;font-size:12px;letter-spacing:3px;cursor:pointer}
        .again:hover{background:rgba(140,100,220,0.1)}
      `}</style>
      <div className="app">
        <div className="stars" aria-hidden>
          {[
            {t:"6%",l:"12%",s:2,d:"0s"},{t:"14%",l:"82%",s:1.5,d:"0.8s"},
            {t:"22%",l:"40%",s:1,d:"1.5s"},{t:"30%",l:"90%",s:2,d:"0.3s"},
            {t:"38%",l:"20%",s:1.5,d:"2s"},{t:"45%",l:"68%",s:1,d:"1.2s"},
            {t:"52%",l:"5%",s:2,d:"0.6s"},{t:"58%",l:"85%",s:1,d:"1.8s"},
            {t:"64%",l:"35%",s:1.5,d:"0.4s"},{t:"72%",l:"75%",s:2,d:"2.2s"},
            {t:"80%",l:"15%",s:1,d:"1s"},{t:"87%",l:"58%",s:1.5,d:"1.6s"},
            {t:"93%",l:"88%",s:2,d:"0.2s"},{t:"18%",l:"30%",s:1,d:"2.5s"},
          ].map((st,i)=>(
            <span key={i} className="star" style={{top:st.t,left:st.l,width:st.s,height:st.s,animationDelay:st.d,boxShadow:`0 0 ${st.s*3}px #d0b0ff`}}/>
          ))}
        </div>
        <div className="glow" style={{top:"8%",left:"-50px",width:220,height:220,background:"rgba(140,100,220,0.25)"}}/>
        <div className="glow" style={{top:"50%",right:"-60px",width:240,height:240,background:"rgba(100,70,180,0.2)",animationDelay:"3s"}}/>
        <div className="glow" style={{bottom:"10%",left:"15%",width:180,height:180,background:"rgba(180,120,220,0.18)",animationDelay:"6s"}}/>
        <header>
          <button className="back" onClick={() => router.push("/")} aria-label="뒤로">←</button>
          <div>
            <div className="h-title">꿈 해몽</div>
            <div className="h-sub">DREAM ORACLE</div>
          </div>
        </header>
        <div className="content">
          {stage === "form" && (
            <>
              <div className="hero">
                <div className="moon" />
                <div className="hero-tag">✦  D R E A M  ✦</div>
                <div className="hero-title">간밤의 꿈</div>
                <div className="hero-desc">
                  꿈에 본 것을 들려주시면<br />그 안에 숨은 뜻을 풀어드립니다
                </div>
              </div>
              <form onSubmit={submit}>
                <div>
                  <label>꿈 내용</label>
                  <textarea
                    value={dream}
                    onChange={(e) => setDream(e.target.value.slice(0, 1000))}
                    placeholder="예: 푸른 강물 위로 흰 용이 솟아올랐다. 비늘이 햇빛에 반짝였고, 나는 강가에 서서 그것을 바라보고 있었다…"
                  />
                  <div className="counter">{dream.length} / 1000</div>
                  <div className="examples">
                    {["🐍 뱀","🐉 용","🦷 이빨 빠지는 꿈","💧 물","🔥 불","☠️ 죽음","💰 돈","🌸 꽃"].map((e) => (
                      <span key={e} className="ex" onClick={() => setDream((p) => (p ? p + " " : "") + e.split(" ").slice(1).join(" ") + "에 대한 꿈을 꿨다.")}>{e}</span>
                    ))}
                  </div>
                </div>
                {error && <div className="err">{error}</div>}
                <div style={{fontFamily:"sans-serif",fontSize:11,color:"rgba(255,255,255,0.55)",textAlign:"center",letterSpacing:1}}>
                  오늘 남은 풀이: <span style={{color:limit.allowed?"#c0a8e0":"#ff9090",fontWeight:600}}>{limit.remaining}</span> / {limit.max}회
                  {!limit.allowed && <div style={{fontSize:10,marginTop:4,color:"rgba(255,255,255,0.35)"}}>{limit.resetText}</div>}
                </div>
                <button type="submit" className="submit" disabled={!limit.allowed} style={!limit.allowed?{opacity:0.4,cursor:"not-allowed"}:undefined}>꿈 풀이 보기</button>
              </form>
            </>
          )}

          {stage === "loading" && (
            <div className="loading">
              <div className="loading-ring" />
              <div className="loading-msg">꿈의 상징을 풀어내는 중</div>
              <div className="loading-sub">잠시만 기다려 주소서…</div>
            </div>
          )}

          {stage === "result" && (
            <>
              <div className="result-head">
                <div className="result-tag">✦  D R E A M  ✦</div>
                <div className="result-name">꿈 풀이</div>
                <div className="result-quote">{dream.length > 80 ? dream.slice(0, 80) + "…" : dream}</div>
              </div>
              <div className="result-body">{result}</div>
              <ShareButtons title={`내 꿈해몽 결과 — 명리천월`} accent="#c0a8e0" />
              <button className="again" onClick={reset} style={{marginTop:8}}>다른 꿈 풀어보기</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
