"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SPREADS, shuffleAndDraw, type DrawnCard, type SpreadDef } from "@/app/lib/tarot";
import { ShareButtons } from "@/app/components/ShareButtons";

type Stage = "intro" | "shuffle" | "reveal" | "loading" | "result";

const TAROT_LIMIT_KEY = "limit_tarot_single";

function checkSingleLimit() {
  if (typeof window === "undefined") return { allowed: true, used: 0 };
  const today = new Date().toDateString();
  try {
    const raw = localStorage.getItem(TAROT_LIMIT_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p.date === today) return { allowed: p.count < 1, used: p.count };
    }
  } catch {}
  return { allowed: true, used: 0 };
}
function recordSingleLimit() {
  if (typeof window === "undefined") return;
  const today = new Date().toDateString();
  let used = 0;
  try {
    const raw = localStorage.getItem(TAROT_LIMIT_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p.date === today) used = p.count;
    }
  } catch {}
  localStorage.setItem(TAROT_LIMIT_KEY, JSON.stringify({ date: today, count: used + 1 }));
}

export default function TarotPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("intro");
  const [spread, setSpread] = useState<SpreadDef>(SPREADS[0]);
  const [question, setQuestion] = useState("");
  const [drawn, setDrawn] = useState<DrawnCard[]>([]);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [limit, setLimit] = useState({ allowed: true, used: 0 });

  useEffect(() => { setLimit(checkSingleLimit()); }, []);

  const startShuffle = () => {
    setError("");
    if (spread.id === "single") {
      const fresh = checkSingleLimit();
      if (!fresh.allowed) {
        setError("오늘 무료 한 장 풀이를 사용했습니다. 내일 자정에 초기화됩니다.");
        setLimit(fresh);
        return;
      }
    }
    if (!question.trim()) {
      setError("어떤 질문을 하시겠습니까?");
      return;
    }
    const cards = shuffleAndDraw(spread.count);
    setDrawn(cards);
    setRevealed(Array(spread.count).fill(false));
    setStage("shuffle");
    setTimeout(() => setStage("reveal"), 2800);
  };

  const flipCard = (idx: number) => {
    setRevealed((p) => {
      const next = [...p];
      next[idx] = true;
      return next;
    });
  };

  const allRevealed = revealed.length > 0 && revealed.every(Boolean);

  const interpret = async () => {
    setStage("loading");
    try {
      const res = await fetch("/api/tarot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          spread: { id: spread.id, name: spread.name, positions: spread.positions },
          cards: drawn.map((d, i) => ({
            position: spread.positions[i],
            nameKo: d.card.nameKo, nameEn: d.card.nameEn,
            reversed: d.reversed,
            upright: d.card.upright, reversedMeaning: d.card.reversed,
            keywords: d.card.keywords,
          })),
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        let msg = `서버 오류 (${res.status})`;
        try { msg = JSON.parse(txt).error || msg; } catch { msg += ` — ${txt.slice(0, 120)}`; }
        throw new Error(msg);
      }
      const data = await res.json();
      setResult(data.result || "");
      if (spread.id === "single") {
        recordSingleLimit();
        setLimit(checkSingleLimit());
      }
      setStage("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
      setStage("reveal");
    }
  };

  const reset = () => {
    setStage("intro");
    setDrawn([]);
    setRevealed([]);
    setResult("");
    setError("");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;700&family=Cinzel:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;background:#000}
        body{font-family:'Noto Serif KR',Georgia,serif;display:flex;justify-content:center}
        .app{position:relative;width:100%;max-width:448px;min-height:100dvh;background:
          radial-gradient(ellipse 80% 50% at 50% 0%,rgba(180,80,180,0.22),transparent 60%),
          radial-gradient(ellipse 60% 40% at 90% 50%,rgba(140,60,160,0.16),transparent 60%),
          radial-gradient(ellipse 50% 40% at 10% 85%,rgba(100,50,140,0.16),transparent 60%),
          #0c0418;
          display:flex;flex-direction:column;color:#f0e0ff}
        .stars{position:absolute;inset:0;pointer-events:none;z-index:1;overflow:hidden}
        .star{position:absolute;background:#fff;border-radius:50%;animation:tw 3s ease-in-out infinite}
        @keyframes tw{0%,100%{opacity:0.25;transform:scale(1)}50%{opacity:1;transform:scale(1.4)}}
        @keyframes fl{0%,100%{transform:translate(0,0)}50%{transform:translate(8px,-12px)}}
        .glow{position:absolute;border-radius:50%;filter:blur(40px);pointer-events:none;z-index:1;animation:fl 10s ease-in-out infinite}
        header,.content{position:relative;z-index:3}
        header{position:fixed;top:0;width:100%;max-width:448px;z-index:100;display:flex;align-items:center;gap:12px;padding:14px 20px;background:rgba(12,4,24,0.92);backdrop-filter:blur(10px);border-bottom:1px solid rgba(180,80,180,0.15)}
        .back{background:transparent;border:none;color:rgba(255,240,255,0.75);font-size:18px;cursor:pointer;padding:0 4px}
        .h-title{font-family:'Cinzel','Noto Serif KR',serif;color:#fff5fc;font-size:16px;letter-spacing:3px;text-shadow:0 0 20px rgba(220,140,220,0.5);font-weight:500}
        .h-sub{font-family:sans-serif;font-size:8px;color:rgba(255,240,255,0.4);letter-spacing:2px;margin-top:2px}
        .content{flex:1;padding:74px 20px 40px;overflow-y:auto}

        .hero{text-align:center;margin-bottom:24px}
        .hero-avatar{width:120px;height:120px;margin:0 auto 14px;border-radius:50%;overflow:hidden;border:2px solid rgba(180,80,180,0.5);box-shadow:0 0 30px rgba(180,80,180,0.4)}
        .hero-avatar img{width:100%;height:100%;object-fit:cover;object-position:center 15%;display:block}
        .hero-tag{font-family:sans-serif;font-size:10px;letter-spacing:6px;color:#c890d0;margin-bottom:6px}
        .hero-name{font-size:22px;color:#fff;letter-spacing:4px;margin-bottom:2px}
        .hero-hanja{font-size:10px;letter-spacing:6px;color:rgba(255,255,255,0.45);margin-bottom:8px}
        .hero-role{font-family:sans-serif;font-size:11px;letter-spacing:3px;color:#a070b0;margin-bottom:10px}
        .hero-desc{font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.55);line-height:1.7}

        label{font-family:sans-serif;font-size:12px;letter-spacing:2px;color:#c898d0;margin-bottom:8px;display:block;font-weight:500}
        textarea,input{width:100%;padding:12px;background:rgba(20,8,32,0.7);border:1px solid rgba(160,80,180,0.3);border-radius:4px;color:#f0e0ff;font-family:inherit;font-size:13px;outline:none;transition:border-color 0.2s;resize:none}
        textarea:focus,input:focus{border-color:rgba(200,120,220,0.7)}
        textarea{min-height:80px;line-height:1.6}
        textarea::placeholder,input::placeholder{color:rgba(255,255,255,0.3)}
        .form-block{margin-bottom:18px}

        .spread-list{display:flex;flex-direction:column;gap:10px;margin-bottom:18px}
        .spread{padding:14px;border:1px solid rgba(160,80,180,0.3);border-radius:6px;cursor:pointer;background:rgba(20,8,32,0.5);transition:all 0.15s;position:relative}
        .spread.on{border-color:rgba(220,140,220,0.8);background:rgba(140,60,160,0.18);box-shadow:0 0 20px rgba(180,80,180,0.2)}
        .spread.locked{opacity:0.55}
        .spread-name{font-size:14px;color:#fff;letter-spacing:2px;margin-bottom:4px}
        .spread-desc{font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.55);line-height:1.5}
        .spread-badge{position:absolute;top:10px;right:12px;font-family:sans-serif;font-size:9px;padding:2px 8px;border-radius:10px;letter-spacing:1px}
        .badge-free{background:rgba(80,200,140,0.2);color:#80e0a0;border:1px solid rgba(100,220,160,0.4)}
        .badge-paid{background:rgba(220,140,80,0.18);color:#e0b070;border:1px solid rgba(220,160,100,0.4)}

        .err{font-family:sans-serif;font-size:11px;color:#ff7090;padding:10px;background:rgba(200,40,80,0.1);border:1px solid rgba(200,60,100,0.3);border-radius:4px;margin-bottom:12px}
        .submit{padding:14px;width:100%;background:linear-gradient(135deg,#a040b0,#c850c0);color:#fff;border:none;border-radius:4px;font-family:'Noto Serif KR',serif;font-size:14px;letter-spacing:4px;cursor:pointer;box-shadow:0 4px 20px rgba(180,80,180,0.3);transition:transform 0.1s;font-weight:500}
        .submit:hover{transform:translateY(-1px)}
        .submit:disabled{opacity:0.4;cursor:not-allowed;transform:none}
        .limit-info{font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.55);text-align:center;letter-spacing:1;margin-bottom:12px}

        .shuffling{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;position:relative}
        .shuffle-stage{position:relative;width:280px;height:280px;margin-bottom:30px;display:flex;align-items:center;justify-content:center;perspective:1000px}
        /* 신비로운 룬 원 */
        .rune-circle{position:absolute;width:260px;height:260px;border-radius:50%;border:1px solid rgba(220,140,240,0.3);box-shadow:0 0 40px rgba(180,80,200,0.4),inset 0 0 30px rgba(180,80,200,0.2);animation:rune-spin 12s linear infinite}
        .rune-circle::before,.rune-circle::after{content:"";position:absolute;inset:20px;border-radius:50%;border:1px dashed rgba(220,140,240,0.25)}
        .rune-circle::after{inset:50px;border-style:solid;border-color:rgba(255,200,255,0.15)}
        @keyframes rune-spin{to{transform:rotate(360deg)}}
        /* 글로우 펄스 */
        .pulse-glow{position:absolute;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(220,140,240,0.4),transparent 70%);animation:pulse 2s ease-in-out infinite;filter:blur(8px)}
        @keyframes pulse{0%,100%{transform:scale(0.85);opacity:0.5}50%{transform:scale(1.15);opacity:1}}
        /* 카드 5장 - 부채꼴 스왈 */
        .shuffle-card{position:absolute;width:90px;height:150px;background:url('/tarot/back.jpg') center/cover;border-radius:6px;border:1px solid rgba(220,140,240,0.6);box-shadow:0 8px 24px rgba(0,0,0,0.6),0 0 20px rgba(180,80,200,0.4);transform-style:preserve-3d;animation:swirl 2.5s ease-in-out infinite}
        @keyframes swirl{
          0%,100%{transform:translate(0,0) rotateY(0) rotateZ(0);opacity:1}
          25%{transform:translate(-60px,-20px) rotateY(180deg) rotateZ(-15deg);opacity:0.85}
          50%{transform:translate(0,-40px) rotateY(360deg) rotateZ(0);opacity:1}
          75%{transform:translate(60px,-20px) rotateY(540deg) rotateZ(15deg);opacity:0.85}
        }
        .shuffle-card:nth-child(3){animation-delay:0s}
        .shuffle-card:nth-child(4){animation-delay:0.2s}
        .shuffle-card:nth-child(5){animation-delay:0.4s}
        .shuffle-card:nth-child(6){animation-delay:0.6s}
        .shuffle-card:nth-child(7){animation-delay:0.8s}
        /* 반짝이는 입자 */
        .sparkle{position:absolute;width:4px;height:4px;background:#fff;border-radius:50%;box-shadow:0 0 8px #fff,0 0 16px #e8a0ff;animation:sparkle-fly 3s ease-in-out infinite}
        @keyframes sparkle-fly{
          0%{transform:translate(0,0) scale(0);opacity:0}
          20%{transform:translate(0,0) scale(1);opacity:1}
          100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0}
        }
        .shuffling-msg{font-size:14px;color:#e8c0ff;letter-spacing:3px;text-shadow:0 0 12px rgba(220,140,240,0.6);animation:msg-glow 2s ease-in-out infinite}
        @keyframes msg-glow{0%,100%{text-shadow:0 0 12px rgba(220,140,240,0.4)}50%{text-shadow:0 0 24px rgba(220,140,240,0.9),0 0 6px rgba(255,200,255,0.6)}}

        .reveal-area{margin-bottom:24px}
        .reveal-question{font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.5);text-align:center;font-style:italic;padding:10px;border:1px dashed rgba(180,80,180,0.3);border-radius:4px;margin-bottom:20px;line-height:1.6}
        .cards-row{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:18px}
        .card-slot{display:flex;flex-direction:column;align-items:center;gap:8px;width:120px}
        .card{width:110px;height:185px;border-radius:8px;cursor:pointer;perspective:1000px;position:relative;transition:transform 0.2s}
        .card:hover{transform:translateY(-4px)}
        .card-inner{position:relative;width:100%;height:100%;transition:transform 0.7s;transform-style:preserve-3d}
        .card.flipped .card-inner{transform:rotateY(180deg)}
        .card-face{position:absolute;width:100%;height:100%;backface-visibility:hidden;border-radius:8px;overflow:hidden;border:1px solid rgba(180,80,180,0.5);box-shadow:0 6px 18px rgba(0,0,0,0.5)}
        .card-back{background:url('/tarot/back.jpg') center/cover}
        .card-front{transform:rotateY(180deg);background:#1a0820}
        .card-front img{width:100%;height:100%;object-fit:cover;display:block}
        .card-front.reversed img{transform:rotate(180deg)}
        .card-pos{font-family:sans-serif;font-size:10px;letter-spacing:2px;color:#c898d0;text-align:center}
        .card-name{font-size:11px;color:#fff;text-align:center;line-height:1.3;min-height:28px}
        .card-name .rev{color:#ff9090;font-size:9px;display:block;margin-top:2px}

        .interpret-btn{padding:14px;width:100%;background:linear-gradient(135deg,#a040b0,#c850c0);color:#fff;border:none;border-radius:4px;font-family:'Noto Serif KR',serif;font-size:14px;letter-spacing:4px;cursor:pointer;font-weight:500;margin-top:10px}
        .interpret-btn:disabled{opacity:0.35;cursor:not-allowed}
        .reset-btn{padding:10px;width:100%;background:transparent;border:1px solid rgba(200,120,220,0.4);color:#c898d0;border-radius:4px;font-family:'Noto Serif KR',serif;font-size:12px;letter-spacing:3px;cursor:pointer;margin-top:10px}

        .loading{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center}
        .loading-ring{width:70px;height:70px;border:2px solid rgba(220,140,220,0.15);border-top-color:#e8a0ff;border-radius:50%;animation:spin 1.2s linear infinite;margin-bottom:24px}
        @keyframes spin{to{transform:rotate(360deg)}}
        .loading-msg{font-size:14px;color:#e8c0ff;letter-spacing:3px;margin-bottom:8px}
        .loading-sub{font-family:sans-serif;font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:2px}

        .result-head{text-align:center;margin-bottom:18px;padding-bottom:18px;border-bottom:1px solid rgba(180,80,180,0.2)}
        .result-tag{font-family:sans-serif;font-size:9px;letter-spacing:5px;color:#c890d0;margin-bottom:6px}
        .result-spread{font-size:18px;color:#fff;letter-spacing:2px}
        .result-q{font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.5);margin-top:8px;font-style:italic}
        .result-cards{display:flex;justify-content:center;gap:10px;margin-bottom:20px;flex-wrap:wrap}
        .result-mini{width:80px;text-align:center}
        .result-mini img{width:80px;height:135px;object-fit:cover;border-radius:5px;border:1px solid rgba(180,80,180,0.4);display:block;margin-bottom:5px}
        .result-mini.reversed img{transform:rotate(180deg)}
        .result-mini-pos{font-family:sans-serif;font-size:9px;color:#c898d0;letter-spacing:1px}
        .result-mini-name{font-size:10px;color:#e8d0f0;line-height:1.3;margin-top:2px}
        .result-body{font-size:13px;line-height:1.9;color:#e8d8f5;white-space:pre-wrap;word-break:keep-all}
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
          ].map((st,i)=>(
            <span key={i} className="star" style={{top:st.t,left:st.l,width:st.s,height:st.s,animationDelay:st.d,boxShadow:`0 0 ${st.s*3}px #f0c0ff`}}/>
          ))}
        </div>
        <div className="glow" style={{top:"8%",left:"-50px",width:220,height:220,background:"rgba(180,80,180,0.25)"}}/>
        <div className="glow" style={{top:"50%",right:"-60px",width:240,height:240,background:"rgba(140,60,160,0.2)",animationDelay:"3s"}}/>
        <header>
          <button className="back" onClick={() => router.push("/")} aria-label="뒤로">←</button>
          <div>
            <div className="h-title">月靈 · 타로</div>
            <div className="h-sub">WOLRYEONG · TAROT</div>
          </div>
        </header>
        <div className="content">
          {stage === "intro" && (
            <>
              <div className="hero">
                <div className="hero-avatar"><img src="/char-wolryeong.png" alt="월령"/></div>
                <div className="hero-tag">✦  T A R O T  ✦</div>
                <div className="hero-name">월령</div>
                <div className="hero-hanja">月靈</div>
                <div className="hero-role">타로 풀이사</div>
                <div className="hero-desc">
                  마음에 품은 물음을 들려주시면<br />
                  운명의 카드를 펼쳐드리리다
                </div>
              </div>

              <div className="form-block">
                <label>스프레드 선택</label>
                <div className="spread-list">
                  {SPREADS.map((s) => (
                    <div key={s.id}
                         className={`spread ${spread.id === s.id ? "on" : ""} ${!s.free ? "locked" : ""}`}
                         onClick={() => setSpread(s)}>
                      <div className="spread-name">{s.name} · {s.count}장</div>
                      <div className="spread-desc">{s.desc}</div>
                      <span className={`spread-badge ${s.free ? "badge-free" : "badge-paid"}`}>
                        {s.free ? "무료" : "유료"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-block">
                <label>질문</label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value.slice(0, 200))}
                  placeholder="예: 지금 시작하려는 일이 잘 풀릴까요?"
                />
              </div>

              {error && <div className="err">{error}</div>}
              {spread.id === "single" && (
                <div className="limit-info">
                  오늘 남은 풀이: <span style={{color:limit.allowed?"#c898d0":"#ff9090",fontWeight:600}}>{limit.allowed?1:0}</span> / 1회
                </div>
              )}
              <button className="submit" onClick={startShuffle} disabled={spread.id==="single" && !limit.allowed}>
                카드 뽑기
              </button>
            </>
          )}

          {stage === "shuffle" && (
            <div className="shuffling">
              <div className="shuffle-stage">
                <div className="rune-circle" />
                <div className="pulse-glow" />
                {[...Array(12)].map((_, i) => {
                  const angle = (i / 12) * Math.PI * 2;
                  const radius = 100 + Math.random() * 30;
                  const tx = Math.cos(angle) * radius;
                  const ty = Math.sin(angle) * radius;
                  return (
                    <span key={i} className="sparkle" style={{
                      animationDelay: `${i * 0.25}s`,
                      ["--tx" as string]: `${tx}px`,
                      ["--ty" as string]: `${ty}px`,
                    } as React.CSSProperties} />
                  );
                })}
                <div className="shuffle-card" />
                <div className="shuffle-card" />
                <div className="shuffle-card" />
                <div className="shuffle-card" />
                <div className="shuffle-card" />
              </div>
              <div className="shuffling-msg">운명의 카드를 섞는 중…</div>
            </div>
          )}

          {stage === "reveal" && (
            <div className="reveal-area">
              <div className="reveal-question">&ldquo;{question}&rdquo;</div>
              <div className="cards-row">
                {drawn.map((d, i) => (
                  <div key={i} className="card-slot">
                    <div className="card-pos">{spread.positions[i]}</div>
                    <div className={`card ${revealed[i] ? "flipped" : ""}`} onClick={() => flipCard(i)}>
                      <div className="card-inner">
                        <div className="card-face card-back" />
                        <div className={`card-face card-front ${d.reversed ? "reversed" : ""}`}>
                          <img src={d.card.image} alt={d.card.nameKo} />
                        </div>
                      </div>
                    </div>
                    <div className="card-name">
                      {revealed[i] ? d.card.nameKo : "??"}
                      {revealed[i] && d.reversed && <span className="rev">역방향</span>}
                    </div>
                  </div>
                ))}
              </div>
              {error && <div className="err">{error}</div>}
              <button className="interpret-btn" onClick={interpret} disabled={!allRevealed}>
                {allRevealed ? "월령에게 풀이 청하기" : "모든 카드를 뒤집어 주세요"}
              </button>
              <button className="reset-btn" onClick={reset}>다시 뽑기</button>
            </div>
          )}

          {stage === "loading" && (
            <div className="loading">
              <div className="loading-ring" />
              <div className="loading-msg">카드의 뜻을 풀어내는 중</div>
              <div className="loading-sub">잠시만 기다려 주소서…</div>
            </div>
          )}

          {stage === "result" && (
            <>
              <div className="result-head">
                <div className="result-tag">✦  M E S S A G E  ✦</div>
                <div className="result-spread">{spread.name}</div>
                <div className="result-q">&ldquo;{question}&rdquo;</div>
              </div>
              <div className="result-cards">
                {drawn.map((d, i) => (
                  <div key={i} className={`result-mini ${d.reversed ? "reversed" : ""}`}>
                    <img src={d.card.image} alt={d.card.nameKo} />
                    <div className="result-mini-pos">{spread.positions[i]}</div>
                    <div className="result-mini-name">{d.card.nameKo}{d.reversed && " (역)"}</div>
                  </div>
                ))}
              </div>
              <div className="result-body">{result}</div>
              <ShareButtons title={`타로 풀이 — 월령(月靈) by 명리천월`} accent="#e8a0ff" />
              <button className="reset-btn" onClick={reset} style={{marginTop:18}}>다른 질문 하기</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
