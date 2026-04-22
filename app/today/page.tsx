"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LIMITS, checkLimit, recordUsage, saveResult, loadResult } from "@/app/lib/limits";
import { ShareButtons } from "@/app/components/ShareButtons";

type Stage = "form" | "loading" | "result";

export default function TodayPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("form");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [limit, setLimit] = useState(checkLimit(LIMITS.today));
  const [form, setForm] = useState({
    name: "",
    year: "",
    month: "",
    day: "",
    gender: "여성",
    calendar: "양력",
  });

  useEffect(() => {
    const saved = localStorage.getItem("today_form");
    if (saved) {
      try { setForm((p) => ({ ...p, ...JSON.parse(saved) })); } catch {}
    }
    setLimit(checkLimit(LIMITS.today));
    const cached = loadResult<{ result: string; form: typeof form }>("today");
    if (cached && cached.payload?.result) {
      const today = new Date();
      const cachedDate = new Date(cached.savedAt);
      if (cachedDate.toDateString() === today.toDateString()) {
        setResult(cached.payload.result);
        setForm((p) => ({ ...p, ...cached.payload.form }));
        setStage("result");
      }
    }
  }, []);

  const update = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: thisYear - 1900 + 1 }, (_, i) => String(thisYear - i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const daysInMonth = (() => {
    const y = Number(form.year), m = Number(form.month);
    if (!y || !m) return 31;
    return new Date(y, m, 0).getDate();
  })();
  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, "0"));

  const birthdate = form.year && form.month && form.day ? `${form.year}-${form.month}-${form.day}` : "";

  const today = new Date();
  const todayStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 ${["일","월","화","수","목","금","토"][today.getDay()]}요일`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !birthdate) {
      setError("이름과 생년월일은 필수입니다");
      return;
    }
    const fresh = checkLimit(LIMITS.today);
    if (!fresh.allowed) {
      setLimit(fresh);
      setError(`오늘 무료 풀이를 모두 사용했습니다 (${fresh.used}/${fresh.max}). ${fresh.resetText}`);
      return;
    }
    setError("");
    setStage("loading");
    localStorage.setItem("today_form", JSON.stringify(form));
    try {
      const res = await fetch("/api/today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          birthdate,
          gender: form.gender,
          calendar: form.calendar,
          today: today.toISOString().slice(0, 10),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `서버 오류 (${res.status})`);
      setResult(data.result || "");
      recordUsage(LIMITS.today);
      saveResult("today", { result: data.result, form });
      setLimit(checkLimit(LIMITS.today));
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
          radial-gradient(ellipse 80% 50% at 50% 0%,rgba(80,140,220,0.22),transparent 60%),
          radial-gradient(ellipse 60% 40% at 90% 50%,rgba(64,160,200,0.15),transparent 60%),
          radial-gradient(ellipse 50% 40% at 10% 85%,rgba(100,120,200,0.14),transparent 60%),
          #060814;
          display:flex;flex-direction:column;color:#e0e6ff}
        .stars{position:absolute;inset:0;pointer-events:none;z-index:1;overflow:hidden}
        .star{position:absolute;background:#fff;border-radius:50%;animation:tw 3s ease-in-out infinite}
        @keyframes tw{0%,100%{opacity:0.25;transform:scale(1)}50%{opacity:1;transform:scale(1.4)}}
        @keyframes fl{0%,100%{transform:translate(0,0)}50%{transform:translate(6px,-10px)}}
        .glow{position:absolute;border-radius:50%;filter:blur(40px);pointer-events:none;z-index:1;animation:fl 10s ease-in-out infinite}
        header,.content{position:relative;z-index:3}
        header{position:fixed;top:0;width:100%;max-width:448px;z-index:100;display:flex;align-items:center;gap:12px;padding:14px 20px;background:rgba(6,8,20,0.9);backdrop-filter:blur(10px);border-bottom:1px solid rgba(100,160,255,0.08)}
        .back{background:transparent;border:none;color:rgba(255,255,255,0.7);font-size:18px;cursor:pointer;padding:0 4px}
        .h-title{font-family:'Cinzel','Noto Serif KR',serif;color:#fff;font-size:16px;letter-spacing:3px;text-shadow:0 0 20px rgba(120,180,255,0.5);font-weight:500}
        .h-sub{font-family:sans-serif;font-size:8px;color:rgba(255,255,255,0.35);letter-spacing:2px;margin-top:2px}
        .content{flex:1;padding:74px 20px 40px;overflow-y:auto}
        .hero{text-align:center;margin-bottom:28px}
        .moon{width:90px;height:90px;margin:0 auto 14px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fffae0,#d4c090 40%,#8b7d50 80%,#4a3f2a);box-shadow:0 0 40px rgba(255,220,140,0.3),inset -8px -10px 20px rgba(0,0,0,0.4);position:relative}
        .moon::after{content:"";position:absolute;top:25%;left:55%;width:12px;height:12px;background:rgba(0,0,0,0.15);border-radius:50%;box-shadow:-18px 12px 0 -2px rgba(0,0,0,0.12),8px 18px 0 -4px rgba(0,0,0,0.1)}
        .hero-tag{font-family:sans-serif;font-size:10px;letter-spacing:6px;color:#80a0d0;margin-bottom:6px}
        .hero-date{font-size:17px;color:#fff;letter-spacing:2px;margin-bottom:4px}
        .hero-desc{font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.55);line-height:1.7;margin-top:8px}
        form{display:flex;flex-direction:column;gap:16px}
        label{font-family:sans-serif;font-size:12px;letter-spacing:2px;color:#9cb8e0;margin-bottom:8px;display:block;font-weight:500}
        input,select{width:100%;padding:11px 12px;background:rgba(10,14,34,0.7);border:1px solid rgba(80,120,200,0.25);border-radius:4px;color:#e8ecff;font-family:inherit;font-size:13px;outline:none;transition:border-color 0.2s}
        input:focus,select:focus{border-color:rgba(120,180,240,0.6)}
        input::placeholder{color:rgba(255,255,255,0.25)}
        .ymd{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:8px}
        .ymd select{padding:11px 10px;cursor:pointer;background:rgba(10,14,34,0.7) url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3e%3cpath d='M1 1l4 4 4-4' stroke='%2380a0d0' stroke-width='1.5' fill='none'/%3e%3c/svg%3e") no-repeat right 10px center;appearance:none;-webkit-appearance:none;padding-right:26px}
        .row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .pill-group{display:flex;gap:8px}
        .pill{flex:1;padding:10px;text-align:center;font-family:sans-serif;font-size:12px;border:1px solid rgba(80,120,200,0.25);background:rgba(10,14,34,0.7);color:rgba(255,255,255,0.55);border-radius:4px;cursor:pointer;transition:all 0.15s}
        .pill.on{background:rgba(80,140,220,0.2);border-color:rgba(120,180,240,0.7);color:#d8e8ff}
        .err{font-family:sans-serif;font-size:11px;color:#ff7090;padding:10px;background:rgba(200,40,80,0.1);border:1px solid rgba(200,60,100,0.3);border-radius:4px}
        .submit{margin-top:10px;padding:14px;background:linear-gradient(135deg,#4a7dd0,#6a9de8);color:#fff;border:none;border-radius:4px;font-family:'Noto Serif KR',serif;font-size:14px;letter-spacing:4px;cursor:pointer;box-shadow:0 4px 20px rgba(80,140,220,0.3);transition:transform 0.1s;font-weight:500}
        .submit:hover{transform:translateY(-1px)}
        .loading{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center}
        .loading-ring{width:70px;height:70px;border:2px solid rgba(120,180,240,0.15);border-top-color:#80c0ff;border-radius:50%;animation:spin 1.2s linear infinite;margin-bottom:24px}
        @keyframes spin{to{transform:rotate(360deg)}}
        .loading-msg{font-size:14px;color:#c0d8ff;letter-spacing:3px;margin-bottom:8px}
        .loading-sub{font-family:sans-serif;font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:2px}
        .result-head{text-align:center;margin-bottom:20px;padding-bottom:18px;border-bottom:1px solid rgba(80,120,200,0.15)}
        .result-tag{font-family:sans-serif;font-size:9px;letter-spacing:5px;color:#80a0d0;margin-bottom:6px}
        .result-name{font-size:18px;color:#fff;letter-spacing:2px}
        .result-meta{font-family:sans-serif;font-size:10px;color:rgba(255,255,255,0.4);margin-top:6px;letter-spacing:1px}
        .result-body{font-size:13px;line-height:1.9;color:#d8dcf0;white-space:pre-wrap;word-break:keep-all}
        .again{margin-top:28px;padding:12px;width:100%;background:transparent;border:1px solid rgba(120,180,240,0.4);color:#a0c0e8;border-radius:4px;font-family:'Noto Serif KR',serif;font-size:12px;letter-spacing:3px;cursor:pointer}
        .again:hover{background:rgba(80,140,220,0.1)}
      `}</style>
      <div className="app">
        <div className="stars" aria-hidden>
          {[
            {t:"8%",l:"15%",s:2,d:"0s"},{t:"12%",l:"78%",s:1.5,d:"0.8s"},
            {t:"20%",l:"45%",s:1,d:"1.5s"},{t:"28%",l:"88%",s:2,d:"0.3s"},
            {t:"35%",l:"22%",s:1.5,d:"2s"},{t:"42%",l:"62%",s:1,d:"1.2s"},
            {t:"50%",l:"8%",s:2,d:"0.6s"},{t:"55%",l:"82%",s:1,d:"1.8s"},
            {t:"62%",l:"38%",s:1.5,d:"0.4s"},{t:"70%",l:"72%",s:2,d:"2.2s"},
            {t:"78%",l:"18%",s:1,d:"1s"},{t:"85%",l:"55%",s:1.5,d:"1.6s"},
            {t:"92%",l:"85%",s:2,d:"0.2s"},{t:"15%",l:"35%",s:1,d:"2.5s"},
          ].map((st,i)=>(
            <span key={i} className="star" style={{top:st.t,left:st.l,width:st.s,height:st.s,animationDelay:st.d,boxShadow:`0 0 ${st.s*3}px #b0d0ff`}}/>
          ))}
        </div>
        <div className="glow" style={{top:"10%",left:"-40px",width:200,height:200,background:"rgba(80,140,220,0.25)"}}/>
        <div className="glow" style={{top:"50%",right:"-60px",width:240,height:240,background:"rgba(100,180,220,0.18)",animationDelay:"3s"}}/>
        <header>
          <button className="back" onClick={() => router.push("/")} aria-label="뒤로">←</button>
          <div>
            <div className="h-title">오늘의 운세</div>
            <div className="h-sub">TODAY&apos;S FORTUNE</div>
          </div>
        </header>
        <div className="content">
          {stage === "form" && (
            <>
              <div className="hero">
                <div className="moon" />
                <div className="hero-tag">✦  T O D A Y  ✦</div>
                <div className="hero-date">{todayStr}</div>
                <div className="hero-desc">
                  오늘 그대에게 찾아올<br />하늘의 기운을 읽어드립니다
                </div>
              </div>
              <form onSubmit={submit}>
                <div>
                  <label>이름</label>
                  <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="홍길동" maxLength={20} />
                </div>
                <div>
                  <label>생년월일</label>
                  <div className="ymd">
                    <select value={form.year} onChange={(e) => update("year", e.target.value)}>
                      <option value="">년</option>
                      {years.map((y) => <option key={y} value={y}>{y}년</option>)}
                    </select>
                    <select value={form.month} onChange={(e) => update("month", e.target.value)}>
                      <option value="">월</option>
                      {months.map((m) => <option key={m} value={m}>{Number(m)}월</option>)}
                    </select>
                    <select value={form.day} onChange={(e) => update("day", e.target.value)}>
                      <option value="">일</option>
                      {days.map((d) => <option key={d} value={d}>{Number(d)}일</option>)}
                    </select>
                  </div>
                </div>
                <div className="row">
                  <div>
                    <label>성별</label>
                    <div className="pill-group">
                      {["여성","남성"].map((g) => (
                        <div key={g} className={`pill ${form.gender===g?"on":""}`} onClick={() => update("gender", g)}>{g}</div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label>달력</label>
                    <div className="pill-group">
                      {["양력","음력"].map((c) => (
                        <div key={c} className={`pill ${form.calendar===c?"on":""}`} onClick={() => update("calendar", c)}>{c}</div>
                      ))}
                    </div>
                  </div>
                </div>
                {error && <div className="err">{error}</div>}
                <div style={{fontFamily:"sans-serif",fontSize:11,color:"rgba(255,255,255,0.55)",textAlign:"center",letterSpacing:1}}>
                  오늘 남은 풀이: <span style={{color:limit.allowed?"#a0c4ff":"#ff9090",fontWeight:600}}>{limit.remaining}</span> / {limit.max}회
                  {!limit.allowed && <div style={{fontSize:10,marginTop:4,color:"rgba(255,255,255,0.35)"}}>{limit.resetText}</div>}
                </div>
                <button type="submit" className="submit" disabled={!limit.allowed} style={!limit.allowed?{opacity:0.4,cursor:"not-allowed"}:undefined}>오늘의 운세 보기</button>
              </form>
            </>
          )}

          {stage === "loading" && (
            <div className="loading">
              <div className="loading-ring" />
              <div className="loading-msg">오늘의 기운을 읽는 중</div>
              <div className="loading-sub">잠시만 기다려 주소서…</div>
            </div>
          )}

          {stage === "result" && (
            <>
              <div className="result-head">
                <div className="result-tag">✦  T O D A Y  ✦</div>
                <div className="result-name">{form.name} 님의 오늘</div>
                <div className="result-meta">{todayStr}</div>
              </div>
              <div className="result-body">{result}</div>
              <ShareButtons title={`${form.name}의 오늘운세 — 명리천월`} accent="#a0c4ff" />
              <button className="again" onClick={reset} style={{marginTop:8}}>다시 보기</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
