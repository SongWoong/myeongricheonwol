"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LIMITS, checkLimit, recordUsage, saveResult, loadResult } from "@/app/lib/limits";
import { ShareButtons } from "@/app/components/ShareButtons";

type Stage = "form" | "loading" | "result";
type FormState = {
  name: string; year: string; month: string; day: string;
  gender: string; calendar: string;
};

export default function TojeongPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("form");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [limit, setLimit] = useState(checkLimit(LIMITS.tojeong));
  const [form, setForm] = useState<FormState>({
    name: "",
    year: "",
    month: "",
    day: "",
    gender: "여성",
    calendar: "양력",
  });

  useEffect(() => {
    const saved = localStorage.getItem("tojeong_form");
    if (saved) {
      try { setForm((p) => ({ ...p, ...JSON.parse(saved) })); } catch {}
    }
    setLimit(checkLimit(LIMITS.tojeong));
    const cached = loadResult<{ result: string; form: FormState; year: number }>("tojeong");
    if (cached?.payload?.result && cached.payload.year === new Date().getFullYear()) {
      setResult(cached.payload.result);
      setForm(cached.payload.form);
      setStage("result");
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

  const callApi = async () => {
    const res = await fetch("/api/tojeong", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        birthdate,
        gender: form.gender,
        calendar: form.calendar,
        targetYear: thisYear,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `서버 오류 (${res.status})`);
    return data.result as string;
  };

  const regenerate = async () => {
    setError("");
    setStage("loading");
    try {
      const text = await callApi();
      setResult(text);
      saveResult("tojeong", { result: text, form, year: thisYear });
      setStage("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
      setStage("result");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !birthdate) {
      setError("이름과 생년월일은 필수입니다");
      return;
    }
    const fresh = checkLimit(LIMITS.tojeong);
    if (!fresh.allowed) {
      setLimit(fresh);
      setError(`올해 무료 비결을 이미 보셨습니다. ${fresh.resetText}`);
      return;
    }
    setError("");
    setStage("loading");
    localStorage.setItem("tojeong_form", JSON.stringify(form));
    try {
      const text = await callApi();
      setResult(text);
      recordUsage(LIMITS.tojeong);
      saveResult("tojeong", { result: text, form, year: thisYear });
      setLimit(checkLimit(LIMITS.tojeong));
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
          radial-gradient(ellipse 80% 50% at 50% 0%,rgba(200,160,80,0.18),transparent 60%),
          radial-gradient(ellipse 60% 40% at 90% 50%,rgba(180,120,60,0.14),transparent 60%),
          radial-gradient(ellipse 50% 40% at 10% 85%,rgba(160,100,50,0.13),transparent 60%),
          #110a06;
          display:flex;flex-direction:column;color:#f0e4cc}
        .stars{position:absolute;inset:0;pointer-events:none;z-index:1;overflow:hidden}
        .star{position:absolute;background:#ffe4a0;border-radius:50%;animation:tw 3s ease-in-out infinite}
        @keyframes tw{0%,100%{opacity:0.25;transform:scale(1)}50%{opacity:1;transform:scale(1.4)}}
        @keyframes fl{0%,100%{transform:translate(0,0)}50%{transform:translate(8px,-12px)}}
        .glow{position:absolute;border-radius:50%;filter:blur(40px);pointer-events:none;z-index:1;animation:fl 10s ease-in-out infinite}
        header,.content{position:relative;z-index:3}
        header{position:fixed;top:0;width:100%;max-width:448px;z-index:100;display:flex;align-items:center;gap:12px;padding:14px 20px;background:rgba(17,10,6,0.92);backdrop-filter:blur(10px);border-bottom:1px solid rgba(200,160,80,0.15)}
        .back{background:transparent;border:none;color:rgba(255,240,210,0.75);font-size:18px;cursor:pointer;padding:0 4px}
        .h-title{font-family:'Cinzel','Noto Serif KR',serif;color:#fff5dc;font-size:16px;letter-spacing:3px;text-shadow:0 0 20px rgba(220,180,100,0.5);font-weight:500}
        .h-sub{font-family:sans-serif;font-size:8px;color:rgba(255,240,210,0.4);letter-spacing:2px;margin-top:2px}
        .content{flex:1;padding:74px 20px 40px;overflow-y:auto}
        .hero{text-align:center;margin-bottom:24px}
        .scroll-icon{width:90px;height:90px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:50px;background:radial-gradient(circle,rgba(200,160,80,0.2),transparent 70%);border-radius:50%;filter:drop-shadow(0 0 20px rgba(220,180,100,0.4))}
        .hero-tag{font-family:sans-serif;font-size:10px;letter-spacing:6px;color:#c8a868;margin-bottom:6px}
        .hero-title{font-size:22px;color:#fff5dc;letter-spacing:5px;margin-bottom:6px}
        .hero-year{font-family:'Cinzel',serif;font-size:13px;color:#d8b878;letter-spacing:3px;margin-bottom:10px}
        .hero-desc{font-family:sans-serif;font-size:11px;color:rgba(255,240,210,0.6);line-height:1.7}
        form{display:flex;flex-direction:column;gap:16px}
        label{font-family:sans-serif;font-size:12px;letter-spacing:2px;color:#d8b878;margin-bottom:8px;display:block;font-weight:500}
        input,select{width:100%;padding:11px 12px;background:rgba(28,18,10,0.7);border:1px solid rgba(180,140,70,0.3);border-radius:4px;color:#f0e4cc;font-family:inherit;font-size:13px;outline:none;transition:border-color 0.2s}
        input:focus,select:focus{border-color:rgba(220,180,100,0.7)}
        input::placeholder{color:rgba(255,240,210,0.25)}
        .ymd{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:8px}
        .ymd select{padding:11px 10px;cursor:pointer;background:rgba(28,18,10,0.7) url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3e%3cpath d='M1 1l4 4 4-4' stroke='%23c8a868' stroke-width='1.5' fill='none'/%3e%3c/svg%3e") no-repeat right 10px center;appearance:none;-webkit-appearance:none;padding-right:26px}
        .row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .pill-group{display:flex;gap:8px}
        .pill{flex:1;padding:10px;text-align:center;font-family:sans-serif;font-size:12px;border:1px solid rgba(180,140,70,0.3);background:rgba(28,18,10,0.7);color:rgba(255,240,210,0.55);border-radius:4px;cursor:pointer;transition:all 0.15s}
        .pill.on{background:rgba(200,160,80,0.18);border-color:rgba(220,180,100,0.7);color:#fff5dc}
        .err{font-family:sans-serif;font-size:11px;color:#ff7090;padding:10px;background:rgba(200,40,80,0.1);border:1px solid rgba(200,60,100,0.3);border-radius:4px}
        .submit{margin-top:10px;padding:14px;background:linear-gradient(135deg,#a07840,#d8a050);color:#fff8e0;border:none;border-radius:4px;font-family:'Noto Serif KR',serif;font-size:14px;letter-spacing:4px;cursor:pointer;box-shadow:0 4px 20px rgba(200,160,80,0.3);transition:transform 0.1s;font-weight:500}
        .submit:hover{transform:translateY(-1px)}
        .loading{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center}
        .loading-ring{width:70px;height:70px;border:2px solid rgba(220,180,100,0.15);border-top-color:#e8c878;border-radius:50%;animation:spin 1.2s linear infinite;margin-bottom:24px}
        @keyframes spin{to{transform:rotate(360deg)}}
        .loading-msg{font-size:14px;color:#f0d8a0;letter-spacing:3px;margin-bottom:8px}
        .loading-sub{font-family:sans-serif;font-size:10px;color:rgba(255,240,210,0.45);letter-spacing:2px}
        .result-head{text-align:center;margin-bottom:20px;padding-bottom:18px;border-bottom:1px solid rgba(180,140,70,0.2)}
        .result-tag{font-family:sans-serif;font-size:9px;letter-spacing:5px;color:#c8a868;margin-bottom:6px}
        .result-name{font-size:18px;color:#fff5dc;letter-spacing:2px}
        .result-meta{font-family:sans-serif;font-size:10px;color:rgba(255,240,210,0.5);margin-top:6px;letter-spacing:1px}
        .result-body{font-size:13px;line-height:1.95;color:#f0e4cc;white-space:pre-wrap;word-break:keep-all}
        .disclaimer{margin-top:20px;padding:10px 12px;font-family:sans-serif;font-size:10px;color:rgba(255,240,210,0.4);background:rgba(28,18,10,0.5);border:1px dashed rgba(180,140,70,0.25);border-radius:4px;line-height:1.6;text-align:center}
        .again{margin-top:18px;padding:12px;width:100%;background:transparent;border:1px solid rgba(220,180,100,0.4);color:#d8b878;border-radius:4px;font-family:'Noto Serif KR',serif;font-size:12px;letter-spacing:3px;cursor:pointer}
        .again:hover{background:rgba(200,160,80,0.1)}
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
            <span key={i} className="star" style={{top:st.t,left:st.l,width:st.s,height:st.s,animationDelay:st.d,boxShadow:`0 0 ${st.s*3}px #ffe4a0`}}/>
          ))}
        </div>
        <div className="glow" style={{top:"8%",left:"-50px",width:220,height:220,background:"rgba(200,160,80,0.22)"}}/>
        <div className="glow" style={{top:"50%",right:"-60px",width:240,height:240,background:"rgba(180,120,60,0.18)",animationDelay:"3s"}}/>
        <header>
          <button className="back" onClick={() => router.push("/")} aria-label="뒤로">←</button>
          <div>
            <div className="h-title">토정비결</div>
            <div className="h-sub">TOJEONG&apos;S ALMANAC</div>
          </div>
        </header>
        <div className="content">
          {stage === "form" && (
            <>
              <div className="hero">
                <div className="scroll-icon">📜</div>
                <div className="hero-tag">✦  土 亭 秘 訣  ✦</div>
                <div className="hero-title">토정비결</div>
                <div className="hero-year">{thisYear}년 한 해의 운세</div>
                <div className="hero-desc">
                  토정 이지함 선생의 비결로<br />올 한 해 그대의 길흉화복을 짚어드립니다
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
                <div style={{fontFamily:"sans-serif",fontSize:11,color:"rgba(255,240,210,0.55)",textAlign:"center",letterSpacing:1}}>
                  {limit.allowed
                    ? <>올해 무료 비결 <span style={{color:"#d8b878",fontWeight:600}}>1회</span> 가능</>
                    : <span style={{color:"#ff9090"}}>올해 비결을 이미 보셨습니다</span>}
                  {!limit.allowed && <div style={{fontSize:10,marginTop:4,color:"rgba(255,240,210,0.4)"}}>{limit.resetText}</div>}
                </div>
                <button type="submit" className="submit" disabled={!limit.allowed} style={!limit.allowed?{opacity:0.4,cursor:"not-allowed"}:undefined}>올해 비결 보기</button>
              </form>
            </>
          )}

          {stage === "loading" && (
            <div className="loading">
              <div className="loading-ring" />
              <div className="loading-msg">한 해의 비결을 펼치는 중</div>
              <div className="loading-sub">잠시만 기다려 주소서…</div>
            </div>
          )}

          {stage === "result" && (
            <>
              <div className="result-head">
                <div className="result-tag">✦  {thisYear}  ✦</div>
                <div className="result-name">{form.name} 님의 비결</div>
                <div className="result-meta">{birthdate} · {form.calendar} · {form.gender}</div>
              </div>
              <div className="result-body">{result}</div>
              <ShareButtons title={`${form.name}의 ${thisYear} 토정비결 — 명리천월`} accent="#d8b878" />
              <div className="disclaimer">
                ※ 정통 만세력으로 사주를 정밀 계산한 후<br />
                해석은 AI 기반으로 작성되었습니다 (참고용)
              </div>
              {process.env.NODE_ENV === "development" && (
                <button className="again" onClick={regenerate} style={{marginBottom:8,opacity:0.7}}>🔄 [DEV] 풀이 다시 받기</button>
              )}
              <button className="again" onClick={reset}>다시 보기</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
