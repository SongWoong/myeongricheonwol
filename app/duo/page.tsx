"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DUO_TOPICS, type DuoTopic } from "@/app/lib/duo-topics";
import { loadResult, saveResult } from "@/app/lib/limits";
import { ShareButtons } from "@/app/components/ShareButtons";

type Stage = "topics" | "form" | "loading" | "result";
type FormState = {
  name: string; year: string; month: string; day: string;
  hour: string; minute: string; gender: string; calendar: string;
};
type DuoCard = { position: string; nameKo: string; nameEn: string; image: string; reversed: boolean };
type DuoResult = { topic: DuoTopic; question: string; result: string; cards: DuoCard[] };

const IS_DEV = process.env.NODE_ENV === "development";

export default function DuoPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("topics");
  const [error, setError] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<DuoTopic | null>(null);
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<DuoResult | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "", year: "", month: "", day: "", hour: "", minute: "",
    gender: "여성", calendar: "양력",
  });

  useEffect(() => {
    // 재사용: 자운 페이지에서 입력한 사주 정보가 있으면 불러옴
    const sajuCached = loadResult<{ form: FormState }>("saju");
    if (sajuCached?.payload?.form) setForm(sajuCached.payload.form);
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
  const hasFormData = !!(form.name && form.year && form.month && form.day);

  const pickTopic = (t: DuoTopic) => {
    setSelectedTopic(t);
    setError("");
    setStage("form");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !birthdate) {
      setError("이름과 생년월일은 필수입니다");
      return;
    }
    if (!selectedTopic) return;
    if (!IS_DEV) {
      setError("곧 결제 기능이 열립니다. 개발 모드에서만 체험 가능합니다.");
      return;
    }
    setError("");
    setStage("loading");
    try {
      const res = await fetch("/api/duo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          birthdate,
          time: timeStr,
          gender: form.gender,
          calendar: form.calendar,
          topicId: selectedTopic.id,
          question,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `서버 오류 (${res.status})`);
      const r: DuoResult = {
        topic: selectedTopic,
        question: question.trim() || `${selectedTopic.title} — ${selectedTopic.desc}`,
        result: data.result,
        cards: data.cards,
      };
      setResult(r);
      saveResult("duo", r);
      setStage("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
      setStage("form");
    }
  };

  const backToTopics = () => {
    setStage("topics");
    setSelectedTopic(null);
    setQuestion("");
    setResult(null);
    setError("");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;700&family=Cinzel:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;background:#000}
        body{font-family:'Noto Serif KR',Georgia,serif;display:flex;justify-content:center}
        .app{position:relative;width:100%;max-width:448px;min-height:100dvh;background:
          radial-gradient(ellipse 80% 50% at 50% 0%,rgba(112,96,224,0.2),transparent 60%),
          radial-gradient(ellipse 60% 40% at 90% 50%,rgba(160,64,192,0.16),transparent 60%),
          radial-gradient(ellipse 50% 40% at 10% 85%,rgba(60,100,200,0.15),transparent 60%),
          #06060f;
          display:flex;flex-direction:column;color:#e8e0f0}
        .stars{position:absolute;inset:0;pointer-events:none;z-index:1;overflow:hidden}
        .star{position:absolute;background:#fff;border-radius:50%;animation:tw 3s ease-in-out infinite}
        @keyframes tw{0%,100%{opacity:0.25;transform:scale(1)}50%{opacity:1;transform:scale(1.4)}}
        header,.content{position:relative;z-index:3}
        header{position:fixed;top:0;width:100%;max-width:448px;z-index:100;display:flex;align-items:center;gap:12px;padding:14px 20px;background:rgba(6,6,15,0.92);backdrop-filter:blur(10px);border-bottom:1px solid rgba(140,120,220,0.15)}
        .back{background:transparent;border:none;color:rgba(255,255,255,0.75);font-size:18px;cursor:pointer;padding:0 4px}
        .h-title{font-family:'Cinzel','Noto Serif KR',serif;color:#fff;font-size:16px;letter-spacing:3px;font-weight:500;text-shadow:0 0 20px rgba(140,120,220,0.5)}
        .h-sub{font-family:sans-serif;font-size:8px;color:rgba(255,255,255,0.4);letter-spacing:2px;margin-top:2px}
        .content{flex:1;padding:74px 20px 40px;overflow-y:auto}

        .duo-hero{display:flex;align-items:center;justify-content:center;gap:0;margin-bottom:18px;position:relative}
        .duo-av{width:100px;height:100px;border-radius:50%;overflow:hidden;border:2px solid rgba(140,120,220,0.5);box-shadow:0 0 24px rgba(140,120,220,0.35)}
        .duo-av img{width:100%;height:100%;object-fit:cover;object-position:center 15%;display:block}
        .duo-av.left{border-color:rgba(112,96,224,0.5);box-shadow:0 0 24px rgba(112,96,224,0.35);transform:translateX(12px)}
        .duo-av.right{border-color:rgba(180,100,180,0.5);box-shadow:0 0 24px rgba(180,100,180,0.35);transform:translateX(-12px);z-index:-1}
        .duo-x{font-family:'Noto Serif KR',serif;font-size:22px;color:#e0c8ff;text-shadow:0 0 14px rgba(220,180,255,0.6);z-index:5;padding:0 4px;font-weight:500}

        .duo-title{text-align:center;margin-bottom:26px}
        .duo-name{font-family:'Cinzel','Noto Serif KR',serif;font-size:20px;color:#fff;letter-spacing:4px;margin-bottom:4px;text-shadow:0 0 20px rgba(140,120,220,0.4)}
        .duo-tag{font-family:sans-serif;font-size:10px;letter-spacing:5px;color:#c0a8e8;margin-bottom:12px}
        .duo-desc{font-family:sans-serif;font-size:12px;color:rgba(255,255,255,0.65);line-height:1.8;max-width:340px;margin:0 auto}
        .duo-desc b{color:#d8c0ff;font-weight:500}

        .sec-head{font-family:sans-serif;font-size:10px;letter-spacing:5px;color:#a090d0;text-align:center;margin:28px 0 10px}
        .sec-sub{font-size:14px;color:#fff;text-align:center;letter-spacing:2px;margin-bottom:20px}

        .topic-list{display:flex;flex-direction:column;gap:10px}
        .topic-card{padding:16px;border:1px solid rgba(140,120,220,0.3);border-radius:10px;background:rgba(20,16,40,0.55);cursor:pointer;transition:all 0.15s;display:flex;align-items:center;gap:14px}
        .topic-card:hover{background:rgba(60,40,100,0.4);border-color:rgba(180,140,240,0.55)}
        .topic-icon{font-size:28px;width:48px;text-align:center;flex-shrink:0}
        .topic-info{flex:1;min-width:0}
        .topic-title{font-size:15px;color:#fff;letter-spacing:1px;margin-bottom:3px}
        .topic-desc{font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.55);line-height:1.5}
        .topic-arrow{color:rgba(200,168,240,0.6);font-size:16px;flex-shrink:0}

        form{display:flex;flex-direction:column;gap:16px}
        label{font-family:sans-serif;font-size:12px;letter-spacing:2px;color:#b8a0e0;margin-bottom:8px;display:block;font-weight:500}
        input,select,textarea{width:100%;padding:11px 12px;background:rgba(20,16,40,0.7);border:1px solid rgba(120,100,200,0.3);border-radius:4px;color:#e8e0f0;font-family:inherit;font-size:13px;outline:none;transition:border-color 0.2s}
        input:focus,select:focus,textarea:focus{border-color:rgba(180,140,240,0.7)}
        input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.3)}
        textarea{min-height:70px;resize:vertical;line-height:1.6}
        .ymd{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:8px}
        .ymd.hm{grid-template-columns:1fr 1fr}
        .ymd select{padding:11px 10px;cursor:pointer;background:rgba(20,16,40,0.7) url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3e%3cpath d='M1 1l4 4 4-4' stroke='%23b0a0e0' stroke-width='1.5' fill='none'/%3e%3c/svg%3e") no-repeat right 10px center;appearance:none;-webkit-appearance:none;padding-right:26px}
        .ymd input[type="number"]::-webkit-inner-spin-button,.ymd input[type="number"]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
        .ymd input[type="number"]{-moz-appearance:textfield}
        .row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .pill-group{display:flex;gap:8px}
        .pill{flex:1;padding:10px;text-align:center;font-family:sans-serif;font-size:12px;border:1px solid rgba(120,100,200,0.3);background:rgba(20,16,40,0.7);color:rgba(255,255,255,0.55);border-radius:4px;cursor:pointer;transition:all 0.15s}
        .pill.on{background:rgba(112,96,224,0.22);border-color:rgba(180,140,240,0.7);color:#fff}

        .selected-banner{padding:12px 14px;background:linear-gradient(135deg,rgba(112,96,224,0.18),rgba(180,100,180,0.14));border:1px solid rgba(180,140,240,0.35);border-radius:8px;display:flex;align-items:center;gap:10px;margin-bottom:10px}
        .selected-banner-icon{font-size:22px}
        .selected-banner-text{flex:1;min-width:0}
        .selected-banner-title{font-size:13px;color:#fff;letter-spacing:1px}
        .selected-banner-desc{font-family:sans-serif;font-size:10px;color:rgba(255,255,255,0.55);margin-top:2px}

        .err{font-family:sans-serif;font-size:11px;color:#ff7090;padding:10px;background:rgba(200,40,80,0.1);border:1px solid rgba(200,60,100,0.3);border-radius:4px}
        .submit{margin-top:10px;padding:14px;background:linear-gradient(135deg,#7060e0,#b050c0);color:#fff;border:none;border-radius:4px;font-family:'Noto Serif KR',serif;font-size:14px;letter-spacing:4px;cursor:pointer;box-shadow:0 4px 24px rgba(140,120,220,0.35);font-weight:500}
        .submit:disabled{opacity:0.4;cursor:not-allowed}

        .loading{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center}
        .loading-ring{width:70px;height:70px;border:2px solid rgba(180,140,240,0.15);border-top-color:#d0a0ff;border-radius:50%;animation:spin 1.2s linear infinite;margin-bottom:24px}
        @keyframes spin{to{transform:rotate(360deg)}}
        .loading-msg{font-size:14px;color:#e0c8ff;letter-spacing:3px;margin-bottom:8px}
        .loading-sub{font-family:sans-serif;font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:2px}

        .result-head{text-align:center;margin-bottom:18px;padding-bottom:18px;border-bottom:1px solid rgba(140,120,220,0.2)}
        .result-tag{font-family:sans-serif;font-size:9px;letter-spacing:5px;color:#c0a8e8;margin-bottom:6px}
        .result-title{font-size:18px;color:#fff;letter-spacing:2px;margin-bottom:6px}
        .result-q{font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.55);margin-top:6px;font-style:italic}
        .cards-row{display:flex;gap:8px;justify-content:center;margin:14px 0}
        .mini-card{flex:1;max-width:110px;text-align:center}
        .mini-card img{width:100%;aspect-ratio:1/1.6;object-fit:cover;border-radius:5px;border:1px solid rgba(140,120,220,0.35);display:block;margin-bottom:5px}
        .mini-card.reversed img{transform:rotate(180deg)}
        .mini-pos{font-family:sans-serif;font-size:9px;color:#b0a0d0;letter-spacing:1px}
        .mini-name{font-size:10px;color:#e0d0f0;line-height:1.3;margin-top:2px}
        .result-body{font-size:13px;line-height:1.9;color:#e0d8f0;white-space:pre-wrap;word-break:keep-all}
        .disclaimer{margin-top:18px;padding:10px 12px;font-family:sans-serif;font-size:10px;color:rgba(255,255,255,0.4);background:rgba(20,16,40,0.5);border:1px dashed rgba(140,120,220,0.25);border-radius:4px;line-height:1.6;text-align:center}
        .again{margin-top:18px;padding:12px;width:100%;background:transparent;border:1px solid rgba(180,140,240,0.4);color:#c0a8e8;border-radius:4px;font-family:'Noto Serif KR',serif;font-size:12px;letter-spacing:3px;cursor:pointer}
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
            <span key={i} className="star" style={{top:st.t,left:st.l,width:st.s,height:st.s,animationDelay:st.d,boxShadow:`0 0 ${st.s*3}px #d0c0ff`}}/>
          ))}
        </div>
        <header>
          <button className="back" onClick={() => stage === "topics" ? router.push("/") : backToTopics()} aria-label="뒤로">←</button>
          <div>
            <div className="h-title">紫雲 × 月靈</div>
            <div className="h-sub">JAWUN × WOLRYEONG</div>
          </div>
        </header>
        <div className="content">
          {stage === "topics" && (
            <>
              <div className="duo-hero">
                <div className="duo-av left"><img src="/char-jawun.png" alt="자운"/></div>
                <div className="duo-x">×</div>
                <div className="duo-av right"><img src="/char-wolryeong.png" alt="월령"/></div>
              </div>
              <div className="duo-title">
                <div className="duo-name">자운 × 월령</div>
                <div className="duo-tag">✦  S A J U  ×  T A R O T  ✦</div>
                <div className="duo-desc">
                  <b>자운</b>이 그대의 사주로 <b>타고난 결</b>을 짚고,<br/>
                  <b>월령</b>이 카드로 <b>지금의 흐름</b>을 비춥니다.<br/>
                  두 풀이사가 하나의 질문에 함께 답해드릴게요.
                </div>
              </div>

              <div className="sec-head">✦  T O P I C  ✦</div>
              <div className="sec-sub">어떤 이야기를 나눌까요?</div>

              <div className="topic-list">
                {DUO_TOPICS.map((t) => (
                  <div key={t.id} className="topic-card" onClick={() => pickTopic(t)}>
                    <div className="topic-icon">{t.icon}</div>
                    <div className="topic-info">
                      <div className="topic-title">{t.title}</div>
                      <div className="topic-desc">{t.desc}</div>
                    </div>
                    <div className="topic-arrow">›</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {stage === "form" && selectedTopic && (
            <>
              <div className="duo-hero">
                <div className="duo-av left"><img src="/char-jawun.png" alt="자운"/></div>
                <div className="duo-x">×</div>
                <div className="duo-av right"><img src="/char-wolryeong.png" alt="월령"/></div>
              </div>

              <div className="selected-banner">
                <div className="selected-banner-icon">{selectedTopic.icon}</div>
                <div className="selected-banner-text">
                  <div className="selected-banner-title">{selectedTopic.title}</div>
                  <div className="selected-banner-desc">{selectedTopic.desc}</div>
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
                <div>
                  <label>태어난 시간 (선택)</label>
                  <div className="ymd hm">
                    <select value={form.hour} onChange={(e) => update("hour", e.target.value)}>
                      <option value="">시</option>
                      {hours.map((h) => <option key={h} value={h}>{Number(h)}시</option>)}
                    </select>
                    <input type="number" min={0} max={59} inputMode="numeric" placeholder="분 (0-59)"
                      value={form.minute}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 2);
                        const n = Number(v);
                        if (v === "" || (n >= 0 && n <= 59)) update("minute", v);
                      }}
                    />
                  </div>
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
                <div>
                  <label>구체적인 질문 (선택)</label>
                  <textarea value={question}
                    onChange={(e) => setQuestion(e.target.value.slice(0, 200))}
                    placeholder={selectedTopic.questionHint}
                  />
                </div>
                {error && <div className="err">{error}</div>}
                <button type="submit" className="submit">
                  {IS_DEV ? "[DEV] 두 풀이 받기" : "풀이 받기 (유료)"}
                </button>
                {hasFormData && (
                  <button type="button" onClick={backToTopics} style={{padding:10,marginTop:4,background:"transparent",border:"1px solid rgba(180,140,240,0.3)",color:"rgba(200,168,232,0.7)",borderRadius:4,fontFamily:"inherit",fontSize:12,letterSpacing:2,cursor:"pointer"}}>
                    다른 주제로
                  </button>
                )}
              </form>
            </>
          )}

          {stage === "loading" && (
            <div className="loading">
              <div className="loading-ring" />
              <div className="loading-msg">두 풀이사가 함께 살피는 중</div>
              <div className="loading-sub">자운이 명식을 읽고 월령이 카드를 펼치는 중…</div>
            </div>
          )}

          {stage === "result" && result && (
            <>
              <div className="result-head">
                <div className="result-tag">✦  {result.topic.title.toUpperCase()}  ✦</div>
                <div className="result-title">{result.topic.icon} {result.topic.title}</div>
                <div className="result-q">&ldquo;{result.question}&rdquo;</div>
              </div>
              <div className="cards-row">
                {result.cards.map((c, i) => (
                  <div key={i} className={`mini-card ${c.reversed ? "reversed" : ""}`}>
                    <img src={c.image} alt={c.nameKo} />
                    <div className="mini-pos">{c.position}</div>
                    <div className="mini-name">{c.nameKo}{c.reversed && " (역)"}</div>
                  </div>
                ))}
              </div>
              <div className="result-body">{result.result}</div>
              <ShareButtons title={`${form.name}의 ${result.topic.title} 풀이 — 자운×월령 by 명리천월`} accent="#c0a8e8" />
              <div className="disclaimer">
                ※ 정통 만세력 + 78장 타로, 두 관점으로 풀이했습니다 (참고용)
              </div>
              <button className="again" onClick={backToTopics} style={{marginTop:8}}>다른 주제로</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
