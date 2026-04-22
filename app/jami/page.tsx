"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LIMITS, checkLimit, recordUsage, saveResult, loadResult } from "@/app/lib/limits";
import { JAMI_CHAPTERS, type JamiChapterDef } from "@/app/lib/jami-chapters";
import { ShareButtons } from "@/app/components/ShareButtons";

type Stage = "chapters" | "form";
type FormState = {
  name: string; year: string; month: string; day: string;
  hour: string; minute: string; gender: string; calendar: string;
};

const IS_DEV = process.env.NODE_ENV === "development";

export default function JamiPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("chapters");
  const [error, setError] = useState("");
  const [generalLimit, setGeneralLimit] = useState(checkLimit(LIMITS.jami));
  const [chapterResults, setChapterResults] = useState<Record<string, string>>({});
  const [chartSummary, setChartSummary] = useState("");
  const [loadingChapter, setLoadingChapter] = useState<string | null>(null);
  const [openChapterId, setOpenChapterId] = useState<string | null>(null);
  const [pendingChapterId, setPendingChapterId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "", year: "", month: "", day: "", hour: "", minute: "00",
    gender: "여성", calendar: "양력",
  });

  useEffect(() => {
    setGeneralLimit(checkLimit(LIMITS.jami));
    const cached = loadResult<{ form: FormState; chapters: Record<string, string>; chart?: string }>("jami");
    if (cached?.payload?.form && cached.payload.chapters) {
      setForm(cached.payload.form);
      setChapterResults(cached.payload.chapters);
      if (cached.payload.chart) setChartSummary(cached.payload.chart);
    }
  }, []);

  const update = (k: keyof FormState, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: thisYear - 1900 + 1 }, (_, i) => String(thisYear - i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const daysInMonth = (() => {
    const y = Number(form.year), m = Number(form.month);
    if (!y || !m) return 31;
    return new Date(y, m, 0).getDate();
  })();
  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, "0"));
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));

  const birthdate = form.year && form.month && form.day ? `${form.year}-${form.month}-${form.day}` : "";
  const timeStr = form.hour && form.minute ? `${form.hour}:${form.minute}` : "";
  const hasFormData = !!(form.name && form.year && form.month && form.day && form.hour);

  const submitFormThenChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !birthdate || !form.hour) {
      setError("이름·생년월일·시간 모두 필요합니다 (자미두수는 시간 필수)");
      return;
    }
    setError("");
    saveResult("jami", { form, chapters: chapterResults, chart: chartSummary });
    setStage("chapters");
    if (pendingChapterId) {
      const chapter = JAMI_CHAPTERS.find((c) => c.id === pendingChapterId);
      if (chapter) {
        const target = chapter;
        setPendingChapterId(null);
        setTimeout(() => generateChapter(target), 100);
      }
    }
  };

  const fetchChapter = async (chapter: JamiChapterDef) => {
    if (chapterResults[chapter.id]) {
      setOpenChapterId(openChapterId === chapter.id ? null : chapter.id);
      return;
    }
    if (!hasFormData) {
      setPendingChapterId(chapter.id);
      setStage("form");
      setError("");
      return;
    }
    await generateChapter(chapter);
  };

  const generateChapter = async (chapter: JamiChapterDef) => {
    if (chapter.price === 0) {
      const fresh = checkLimit(LIMITS.jami);
      if (!fresh.allowed) {
        setError(`'${chapter.title}' 무료 풀이를 올해 이미 보셨습니다. ${fresh.resetText}`);
        return;
      }
    } else if (!IS_DEV) {
      setError(`'${chapter.title}'은(는) 유료 챕터입니다 (구현 예정)`);
      return;
    }
    setError("");
    setLoadingChapter(chapter.id);
    setOpenChapterId(chapter.id);
    try {
      const res = await fetch("/api/jami", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, birthdate,
          hour: Number(form.hour), minute: Number(form.minute) || 0,
          gender: form.gender, calendar: form.calendar,
          chapterId: chapter.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `서버 오류 (${res.status})`);
      const next = { ...chapterResults, [chapter.id]: data.result };
      setChapterResults(next);
      setChartSummary(data.chart || chartSummary);
      saveResult("jami", { form, chapters: next, chart: data.chart || chartSummary });
      if (chapter.price === 0) {
        recordUsage(LIMITS.jami);
        setGeneralLimit(checkLimit(LIMITS.jami));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoadingChapter(null);
    }
  };

  const regenerate = async (chapter: JamiChapterDef) => {
    setError("");
    setLoadingChapter(chapter.id);
    setOpenChapterId(chapter.id);
    try {
      const res = await fetch("/api/jami", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, birthdate,
          hour: Number(form.hour), minute: Number(form.minute) || 0,
          gender: form.gender, calendar: form.calendar,
          chapterId: chapter.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `서버 오류 (${res.status})`);
      const next = { ...chapterResults, [chapter.id]: data.result };
      setChapterResults(next);
      setChartSummary(data.chart || chartSummary);
      saveResult("jami", { form, chapters: next, chart: data.chart || chartSummary });
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoadingChapter(null);
    }
  };

  const editForm = () => { setStage("form"); setError(""); };
  const cancelForm = () => { setStage("chapters"); setPendingChapterId(null); setError(""); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;700&family=Cinzel:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;background:#000}
        body{font-family:'Noto Serif KR',Georgia,serif;display:flex;justify-content:center}
        .app{position:relative;width:100%;max-width:448px;min-height:100dvh;background:
          radial-gradient(ellipse 80% 50% at 50% 0%,rgba(60,120,200,0.22),transparent 60%),
          radial-gradient(ellipse 60% 40% at 90% 50%,rgba(80,60,180,0.18),transparent 60%),
          radial-gradient(ellipse 50% 40% at 10% 85%,rgba(40,100,180,0.14),transparent 60%),
          #04081a;
          display:flex;flex-direction:column;color:#e0e8ff}
        .stars{position:absolute;inset:0;pointer-events:none;z-index:1;overflow:hidden}
        .star{position:absolute;background:#fff;border-radius:50%;animation:tw 3s ease-in-out infinite}
        @keyframes tw{0%,100%{opacity:0.25;transform:scale(1)}50%{opacity:1;transform:scale(1.4)}}
        @keyframes fl{0%,100%{transform:translate(0,0)}50%{transform:translate(8px,-12px)}}
        .glow{position:absolute;border-radius:50%;filter:blur(40px);pointer-events:none;z-index:1;animation:fl 10s ease-in-out infinite}
        header,.content{position:relative;z-index:3}
        header{position:fixed;top:0;width:100%;max-width:448px;z-index:100;display:flex;align-items:center;gap:12px;padding:14px 20px;background:rgba(4,8,26,0.92);backdrop-filter:blur(10px);border-bottom:1px solid rgba(80,140,220,0.15)}
        .back{background:transparent;border:none;color:rgba(255,255,255,0.7);font-size:18px;cursor:pointer;padding:0 4px}
        .h-title{font-family:'Cinzel','Noto Serif KR',serif;color:#fff;font-size:16px;letter-spacing:3px;text-shadow:0 0 20px rgba(120,180,240,0.5);font-weight:500}
        .h-sub{font-family:sans-serif;font-size:8px;color:rgba(255,255,255,0.4);letter-spacing:2px;margin-top:2px}
        .content{flex:1;padding:74px 20px 40px;overflow-y:auto}

        .intro{text-align:center;margin-bottom:24px}
        .intro-avatar{width:130px;height:130px;margin:0 auto 14px;border-radius:50%;overflow:hidden;border:2px solid rgba(80,140,220,0.5);box-shadow:0 0 30px rgba(80,140,220,0.4)}
        .intro-avatar img{width:100%;height:100%;object-fit:cover;object-position:center 15%;display:block}
        .intro-name{font-size:20px;letter-spacing:4px;color:#fff;margin-bottom:2px}
        .intro-hanja{font-size:10px;letter-spacing:6px;color:rgba(255,255,255,0.4);margin-bottom:10px}
        .intro-role{font-family:sans-serif;font-size:10px;letter-spacing:3px;color:#80a8d8;margin-bottom:10px}
        .intro-desc{font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.55);line-height:1.7}

        form{display:flex;flex-direction:column;gap:16px}
        label{font-family:sans-serif;font-size:12px;letter-spacing:2px;color:#9cb8e0;margin-bottom:8px;display:block;font-weight:500}
        input,select{width:100%;padding:11px 12px;background:rgba(10,18,40,0.7);border:1px solid rgba(80,140,220,0.3);border-radius:4px;color:#e0e8ff;font-family:inherit;font-size:13px;outline:none;transition:border-color 0.2s}
        input:focus,select:focus{border-color:rgba(120,180,240,0.7)}
        input::placeholder{color:rgba(255,255,255,0.25)}
        .ymd{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:8px}
        .ymd.hm{grid-template-columns:1fr 1fr}
        .ymd select{padding:11px 10px;cursor:pointer;background:rgba(10,18,40,0.7) url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3e%3cpath d='M1 1l4 4 4-4' stroke='%2390b4dc' stroke-width='1.5' fill='none'/%3e%3c/svg%3e") no-repeat right 10px center;appearance:none;-webkit-appearance:none;padding-right:26px}
        .ymd input[type="number"]{-moz-appearance:textfield}
        .ymd input[type="number"]::-webkit-outer-spin-button,.ymd input[type="number"]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
        .row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .pill-group{display:flex;gap:8px}
        .pill{flex:1;padding:10px;text-align:center;font-family:sans-serif;font-size:12px;border:1px solid rgba(80,140,220,0.3);background:rgba(10,18,40,0.7);color:rgba(255,255,255,0.55);border-radius:4px;cursor:pointer;transition:all 0.15s}
        .pill.on{background:rgba(60,120,200,0.25);border-color:rgba(120,180,240,0.7);color:#fff}
        .hint{font-family:sans-serif;font-size:10px;color:rgba(255,255,255,0.35);margin-top:6px}
        .err{font-family:sans-serif;font-size:11px;color:#ff7090;padding:10px;background:rgba(200,40,80,0.1);border:1px solid rgba(200,60,100,0.3);border-radius:4px;margin-bottom:12px}
        .submit{margin-top:10px;padding:14px;background:linear-gradient(135deg,#3060c0,#5040c0);color:#fff;border:none;border-radius:4px;font-family:'Noto Serif KR',serif;font-size:14px;letter-spacing:4px;cursor:pointer;box-shadow:0 4px 20px rgba(80,140,220,0.3);font-weight:500}

        .summary-bar{padding:14px 16px;background:rgba(10,18,40,0.7);border:1px solid rgba(80,140,220,0.3);border-radius:8px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:center;gap:12px}
        .summary-info{flex:1;min-width:0}
        .summary-name{font-size:15px;color:#fff;letter-spacing:1px;margin-bottom:3px}
        .summary-meta{font-family:sans-serif;font-size:10px;color:rgba(255,255,255,0.55);letter-spacing:0.5px}
        .summary-edit{padding:6px 12px;font-family:sans-serif;font-size:10px;background:transparent;border:1px solid rgba(140,180,240,0.45);color:#a0c4e8;border-radius:4px;cursor:pointer;letter-spacing:1px}
        .chart-summary{margin-bottom:14px;padding:10px 14px;font-family:'Courier New',monospace;font-size:10px;background:rgba(8,14,30,0.6);border:1px solid rgba(80,140,220,0.2);border-radius:6px;color:#a0c8e8;text-align:center;letter-spacing:0.5px}

        .chapters-title{font-family:sans-serif;font-size:11px;letter-spacing:5px;color:#90b4dc;text-align:center;margin-bottom:6px}
        .chapters-sub{font-size:14px;color:#fff;text-align:center;letter-spacing:2px;margin-bottom:18px}

        .chapter-card{margin-bottom:10px;border:1px solid rgba(80,140,220,0.3);border-radius:8px;background:rgba(10,18,40,0.55);overflow:hidden;transition:all 0.2s}
        .chapter-card.has-result{border-color:rgba(120,180,240,0.5)}
        .chapter-head{display:flex;align-items:center;gap:12px;padding:14px;cursor:pointer;transition:background 0.15s}
        .chapter-head:hover{background:rgba(80,140,220,0.08)}
        .chapter-icon{font-family:'Noto Serif KR',serif;font-size:26px;width:42px;text-align:center;flex-shrink:0;color:#a0c8ff;text-shadow:0 0 12px rgba(120,180,240,0.6);font-weight:500;letter-spacing:0}
        .chapter-info{flex:1;min-width:0}
        .chapter-title{font-size:14px;color:#fff;letter-spacing:1px;margin-bottom:2px;display:flex;align-items:center;gap:6px}
        .chapter-desc{font-family:sans-serif;font-size:10px;color:rgba(255,255,255,0.5);line-height:1.4}
        .chapter-badge{font-family:sans-serif;font-size:9px;padding:2px 8px;border-radius:10px;letter-spacing:1px;flex-shrink:0;white-space:nowrap}
        .badge-free{background:rgba(80,200,140,0.2);color:#80e0a0;border:1px solid rgba(100,220,160,0.4)}
        .badge-paid{background:rgba(220,140,80,0.18);color:#e0b070;border:1px solid rgba(220,160,100,0.4)}
        .badge-done{background:rgba(120,160,220,0.2);color:#a0c8e8;border:1px solid rgba(140,180,240,0.4)}
        .chapter-arrow{color:rgba(140,180,240,0.6);font-size:14px;transition:transform 0.2s;flex-shrink:0}
        .chapter-card.open .chapter-arrow{transform:rotate(90deg)}
        .chapter-body{padding:0 16px 16px;border-top:1px solid rgba(80,140,220,0.18);margin-top:0}
        .chapter-body-inner{padding-top:14px}
        .chapter-loading{padding:20px;text-align:center;color:#a0c8e8;font-family:sans-serif;font-size:12px;letter-spacing:2px}
        .chapter-loading-ring{display:inline-block;width:24px;height:24px;border:2px solid rgba(120,180,240,0.2);border-top-color:#90c0ff;border-radius:50%;animation:spin 1s linear infinite;vertical-align:middle;margin-right:10px}
        @keyframes spin{to{transform:rotate(360deg)}}
        .chapter-result{font-size:13px;line-height:1.85;color:#dcdcf0;white-space:pre-wrap;word-break:keep-all}
        .chapter-actions{margin-top:14px;display:flex;gap:8px;justify-content:flex-end}
        .chapter-actions button{padding:7px 12px;font-family:sans-serif;font-size:10px;background:transparent;border:1px solid rgba(140,180,240,0.3);color:rgba(168,200,232,0.8);border-radius:4px;cursor:pointer;letter-spacing:1px}
        .recommend{margin-top:22px;padding:16px;background:linear-gradient(135deg,rgba(60,120,200,0.12),rgba(80,60,180,0.08));border:1px solid rgba(120,180,240,0.3);border-radius:8px}
        .recommend-title{font-family:sans-serif;font-size:10px;letter-spacing:4px;color:#a0c8e8;text-align:center;margin-bottom:4px}
        .recommend-sub{font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.55);text-align:center;margin-bottom:14px;line-height:1.5}
        .recommend-list{display:flex;flex-direction:column;gap:8px}
        .recommend-card{display:flex;align-items:center;gap:10px;padding:12px;background:rgba(10,18,40,0.6);border:1px solid rgba(120,180,240,0.25);border-radius:6px;cursor:pointer;transition:all 0.15s}
        .recommend-card:hover{background:rgba(60,120,200,0.18);border-color:rgba(140,200,250,0.55)}
        .recommend-icon{font-family:'Noto Serif KR',serif;font-size:22px;color:#a0c8ff;text-shadow:0 0 10px rgba(120,180,240,0.5);font-weight:500;width:32px;text-align:center;flex-shrink:0}
        .recommend-info{flex:1;min-width:0}
        .recommend-name{font-size:13px;color:#fff;letter-spacing:0.5px;margin-bottom:2px}
        .recommend-desc-sm{font-family:sans-serif;font-size:10px;color:rgba(255,255,255,0.5);line-height:1.3}
        .recommend-cta{font-family:sans-serif;font-size:10px;color:#e0b070;letter-spacing:1px;flex-shrink:0;font-weight:600}

        .disclaimer{margin-top:18px;padding:10px 12px;font-family:sans-serif;font-size:10px;color:rgba(255,255,255,0.4);background:rgba(10,18,40,0.5);border:1px dashed rgba(80,140,220,0.25);border-radius:4px;line-height:1.6;text-align:center}
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
            <span key={i} className="star" style={{top:st.t,left:st.l,width:st.s,height:st.s,animationDelay:st.d,boxShadow:`0 0 ${st.s*3}px #c0d8ff`}}/>
          ))}
        </div>
        <div className="glow" style={{top:"8%",left:"-50px",width:220,height:220,background:"rgba(60,120,200,0.25)"}}/>
        <div className="glow" style={{top:"50%",right:"-60px",width:240,height:240,background:"rgba(80,60,180,0.2)",animationDelay:"3s"}}/>
        <header>
          <button className="back" onClick={() => router.push("/")} aria-label="뒤로">←</button>
          <div>
            <div className="h-title">星淵 · 자미두수</div>
            <div className="h-sub">SEONGYEON · ZIWEI</div>
          </div>
        </header>
        <div className="content">
          {stage === "form" && (
            <>
              <div className="intro">
                <div className="intro-avatar"><img src="/char-seongha.png" alt="성연"/></div>
                <div className="intro-name">성연</div>
                <div className="intro-hanja">星淵</div>
                <div className="intro-role">자미두수 풀이사</div>
                <div className="intro-desc">
                  {pendingChapterId
                    ? <>먼저 그대의 정보를<br/>알려주세요 (시간 필수)</>
                    : <>그대의 태어난 순간을 알려주시면<br/>별의 자리를 펼쳐드릴게요</>}
                </div>
              </div>
              <form onSubmit={submitFormThenChapter}>
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
                <div>
                  <label>태어난 시간 (필수)</label>
                  <div className="ymd hm">
                    <select value={form.hour} onChange={(e) => update("hour", e.target.value)}>
                      <option value="">시</option>
                      {hours.map((h) => <option key={h} value={h}>{Number(h)}시</option>)}
                    </select>
                    <input
                      type="number" min={0} max={59} inputMode="numeric"
                      placeholder="분 (0-59)"
                      value={form.minute}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 2);
                        const n = Number(v);
                        if (v === "" || (n >= 0 && n <= 59)) update("minute", v);
                      }}
                    />
                  </div>
                  <div className="hint">자미두수는 시간이 정확해야 명궁이 정확합니다</div>
                </div>
                <div className="row">
                  <div>
                    <label>성별</label>
                    <div className="pill-group">
                      {["여성", "남성"].map((g) => (
                        <div key={g} className={`pill ${form.gender === g ? "on" : ""}`} onClick={() => update("gender", g)}>{g}</div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label>달력</label>
                    <div className="pill-group">
                      {["양력", "음력"].map((c) => (
                        <div key={c} className={`pill ${form.calendar === c ? "on" : ""}`} onClick={() => update("calendar", c)}>{c}</div>
                      ))}
                    </div>
                  </div>
                </div>
                {error && <div className="err">{error}</div>}
                <button type="submit" className="submit">
                  {pendingChapterId
                    ? `${JAMI_CHAPTERS.find(c=>c.id===pendingChapterId)?.title} 풀이 받기`
                    : "저장하고 챕터로"}
                </button>
                {hasFormData && (
                  <button type="button" onClick={cancelForm} style={{padding:10,marginTop:4,background:"transparent",border:"1px solid rgba(140,180,240,0.3)",color:"rgba(168,200,232,0.7)",borderRadius:4,fontFamily:"inherit",fontSize:12,letterSpacing:2,cursor:"pointer"}}>
                    취소
                  </button>
                )}
              </form>
            </>
          )}

          {stage === "chapters" && (
            <>
              <div className="intro" style={{marginBottom:16}}>
                <div className="intro-avatar"><img src="/char-seongha.png" alt="성연"/></div>
                <div className="intro-name">성연</div>
                <div className="intro-hanja">星淵</div>
                <div className="intro-role">자미두수 풀이사</div>
              </div>

              {hasFormData && (
                <div className="summary-bar">
                  <div className="summary-info">
                    <div className="summary-name">{form.name} 님</div>
                    <div className="summary-meta">{birthdate} · {form.calendar} · {timeStr || "시 미상"} · {form.gender}</div>
                  </div>
                  <button className="summary-edit" onClick={editForm}>수정</button>
                </div>
              )}
              {hasFormData && chartSummary && (
                <div className="chart-summary">{chartSummary}</div>
              )}

              <div className="chapters-title">✦  C H A P T E R S  ✦</div>
              <div className="chapters-sub">{hasFormData ? "풀이 챕터를 선택하세요" : "원하는 챕터를 선택하면 정보를 입력해요"}</div>

              {error && <div className="err">{error}</div>}

              {JAMI_CHAPTERS.map((ch) => {
                const hasResult = !!chapterResults[ch.id];
                const isOpen = openChapterId === ch.id;
                const isLoading = loadingChapter === ch.id;
                const isFree = ch.price === 0;
                return (
                  <div key={ch.id} className={`chapter-card ${hasResult?"has-result":""} ${isOpen?"open":""}`}>
                    <div className="chapter-head" onClick={() => fetchChapter(ch)}>
                      <div className="chapter-icon">{ch.icon}</div>
                      <div className="chapter-info">
                        <div className="chapter-title">
                          {ch.title}
                          {hasResult && <span className="chapter-badge badge-done">✓ 풀이 완료</span>}
                          {!hasResult && isFree && <span className="chapter-badge badge-free">무료</span>}
                          {!hasResult && !isFree && (
                            <span className="chapter-badge badge-paid">{IS_DEV ? "[DEV] 무료" : "유료"}</span>
                          )}
                        </div>
                        <div className="chapter-desc">{ch.desc}</div>
                      </div>
                      <div className="chapter-arrow">›</div>
                    </div>
                    {isOpen && (
                      <div className="chapter-body">
                        <div className="chapter-body-inner">
                          {isLoading && (
                            <div className="chapter-loading">
                              <span className="chapter-loading-ring" />성연이 별의 자리를 살피는 중…
                            </div>
                          )}
                          {!isLoading && hasResult && (
                            <>
                              <div className="chapter-result">{chapterResults[ch.id]}</div>
                              <ShareButtons title={`${form.name}의 ${ch.title} — 성연(星淵) 자미두수 by 명리천월`} accent="#a0c8ff" />
                              {ch.recommendNext && ch.recommendNext.length > 0 && (
                                <div className="recommend">
                                  <div className="recommend-title">✦ 더 깊이 알아보기 ✦</div>
                                  <div className="recommend-sub">이 풀이가 마음에 드셨다면, 그대만의 더 깊은 풀이를 추천드려요</div>
                                  <div className="recommend-list">
                                    {ch.recommendNext.map((rid) => {
                                      const rec = JAMI_CHAPTERS.find((c) => c.id === rid);
                                      if (!rec) return null;
                                      return (
                                        <div key={rid} className="recommend-card" onClick={() => fetchChapter(rec)}>
                                          <span className="recommend-icon">{rec.icon}</span>
                                          <div className="recommend-info">
                                            <div className="recommend-name">{rec.title}</div>
                                            <div className="recommend-desc-sm">{rec.desc}</div>
                                          </div>
                                          <span className="recommend-cta">{IS_DEV ? "[DEV] 보기" : "유료 ›"}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                              {IS_DEV && (
                                <div className="chapter-actions">
                                  <button onClick={() => regenerate(ch)}>🔄 [DEV] 다시 받기</button>
                                </div>
                              )}
                            </>
                          )}
                          {!isLoading && !hasResult && (
                            <div className="chapter-loading">
                              풀이를 시작하려면 챕터를 다시 클릭하세요
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="disclaimer">
                ※ 정통 자미두수 명반을 정밀 계산 후<br />
                해석은 AI 기반으로 작성되었습니다 (참고용)
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
