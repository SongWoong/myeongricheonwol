"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const CITIES = [
  { name: "선택 안 함 (KST)", longitude: 0 },
  { name: "서울 (126.98°)", longitude: 126.98 },
  { name: "부산 (129.08°)", longitude: 129.08 },
  { name: "인천 (126.70°)", longitude: 126.70 },
  { name: "대구 (128.60°)", longitude: 128.60 },
  { name: "대전 (127.38°)", longitude: 127.38 },
  { name: "광주 (126.85°)", longitude: 126.85 },
  { name: "울산 (129.31°)", longitude: 129.31 },
  { name: "제주 (126.53°)", longitude: 126.53 },
  { name: "도쿄 (139.69°)", longitude: 139.69 },
  { name: "직접 입력", longitude: -1 },
];

const PLANS = [
  {
    id: "core" as const,
    name: "코어 풀이",
    price: 9900,
    pages: "약 15~20p",
    chapters: [
      { icon: "命", title: "종합 풀이", desc: "사주 총평 · 대운 흐름 · 올해 운세" },
      { icon: "緣", title: "사랑·인연", desc: "연애·결혼·배우자·궁합" },
      { icon: "運", title: "대운 자세히", desc: "10년 단위 인생 큰 흐름" },
      { icon: "歲", title: "올해 자세히", desc: "12개월 월별 운세" },
    ],
  },
  {
    id: "full" as const,
    name: "전체 풀이",
    price: 19900,
    pages: "약 30~40p",
    rec: true,
    chapters: [
      { icon: "命", title: "종합 풀이", desc: "사주 총평 · 대운 흐름 · 올해 운세" },
      { icon: "緣", title: "사랑·인연", desc: "연애·결혼·배우자·궁합" },
      { icon: "財", title: "재물·금전", desc: "재산·투자·소비·돈의 흐름" },
      { icon: "職", title: "직업·진로", desc: "적성·이직·승진·자영업" },
      { icon: "康", title: "건강·체질", desc: "체질·약한 부위·관리법" },
      { icon: "家", title: "가족·자녀", desc: "부모·형제·배우자·자녀운" },
      { icon: "運", title: "대운 자세히", desc: "10년 단위 인생 큰 흐름" },
      { icon: "歲", title: "올해 자세히", desc: "12개월 월별 운세" },
    ],
  },
];

type PdfType = "core" | "full";
type FormState = {
  name: string; year: string; month: string; day: string;
  hour: string; minute: string; gender: string; calendar: string;
  city: string; longitude: string;
};

const IS_DEV = process.env.NODE_ENV === "development";


export default function PdfPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<PdfType | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "", year: "", month: "", day: "", hour: "", minute: "",
    gender: "여성", calendar: "양력", city: "", longitude: "",
  });
  const [loading, setLoading] = useState<PdfType | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState<PdfType | null>(null);

  const thisYear = new Date().getFullYear();
  const years  = Array.from({ length: thisYear - 1900 + 1 }, (_, i) => String(thisYear - i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const daysCount = (() => {
    const y = Number(form.year), m = Number(form.month);
    return (!y || !m) ? 31 : new Date(y, m, 0).getDate();
  })();
  const days  = Array.from({ length: daysCount }, (_, i) => String(i + 1).padStart(2, "0"));
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));

  const update = (k: keyof FormState, v: string) => setForm(p => ({ ...p, [k]: v }));
  const birthdate = form.year && form.month && form.day ? `${form.year}-${form.month}-${form.day}` : "";
  const timeStr   = form.hour && form.minute ? `${form.hour}:${form.minute}` : "";
  const hasForm   = !!(form.name && birthdate);

  const plan = PLANS.find(p => p.id === selected);

  const purchase = async () => {
    if (!selected || !hasForm) { setError("이름과 생년월일은 필수입니다."); return; }
    setError(""); setDone(null); setLoading(selected);
    try {
      const res = await fetch("/api/saju/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, birthdate, time: timeStr,
          gender: form.gender, calendar: form.calendar,
          longitude: form.longitude ? Number(form.longitude) : undefined,
          pdfType: selected,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "생성 실패"); }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url;
      a.download = `${form.name}_사주명서_${selected === "full" ? "전체" : "코어"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setDone(selected);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;700&family=Cinzel:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;background:#000}
        body{font-family:'Noto Serif KR',Georgia,serif;display:flex;justify-content:center}
        .app{width:100%;max-width:448px;min-height:100dvh;background:
          radial-gradient(ellipse 80% 50% at 50% 0%,rgba(90,70,180,0.22),transparent 60%),
          radial-gradient(ellipse 50% 40% at 90% 70%,rgba(60,40,140,0.15),transparent 60%),
          #07060f;
          display:flex;flex-direction:column;color:#dcdce8}

        header{position:fixed;top:0;width:100%;max-width:448px;z-index:100;display:flex;align-items:center;gap:12px;padding:14px 20px;background:rgba(7,6,15,0.93);backdrop-filter:blur(12px);border-bottom:1px solid rgba(120,100,200,0.12)}
        .back{background:transparent;border:none;color:rgba(255,255,255,0.7);font-size:18px;cursor:pointer;padding:0 4px}
        .h-title{font-family:'Cinzel','Noto Serif KR',serif;color:#fff;font-size:15px;letter-spacing:3px;font-weight:500}
        .h-sub{font-family:sans-serif;font-size:8px;color:rgba(255,255,255,0.35);letter-spacing:2px;margin-top:2px}
        .content{flex:1;padding:74px 20px 52px;overflow-y:auto}

        /* ── 히어로 ── */
        .hero{text-align:center;padding:10px 0 28px;border-bottom:1px solid rgba(100,80,180,0.15);margin-bottom:24px}
        .hero-book{display:flex;justify-content:center;margin-bottom:18px}
        .hero-book img{width:200px;height:200px;object-fit:cover;border-radius:12px;box-shadow:0 8px 40px rgba(60,40,160,0.6),0 0 60px rgba(100,70,200,0.25)}
        .hero-tag{font-family:sans-serif;font-size:9px;letter-spacing:6px;color:rgba(160,130,220,0.65);margin-bottom:8px}
        .hero-hanja{font-family:'Noto Serif KR',serif;font-size:30px;color:#fff;font-weight:500;letter-spacing:8px;text-shadow:0 0 20px rgba(140,110,240,0.5);margin-bottom:3px}
        .hero-name{font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:5px;margin-bottom:10px}
        .hero-desc{font-family:sans-serif;font-size:11.5px;color:rgba(255,255,255,0.55);line-height:1.8}
        .hero-desc strong{color:rgba(200,168,112,0.9);font-weight:500}

        /* ── 플랜 카드 ── */
        .section-label{font-family:sans-serif;font-size:10px;letter-spacing:4px;color:rgba(140,110,220,0.7);margin-bottom:12px}
        .plans{display:flex;flex-direction:column;gap:10px;margin-bottom:24px}
        .plan{border-radius:10px;border:1.5px solid rgba(90,70,170,0.28);background:rgba(18,14,38,0.65);cursor:pointer;transition:all 0.15s;overflow:hidden}
        .plan.sel{border-color:rgba(150,110,240,0.75);background:rgba(45,32,95,0.75);box-shadow:0 0 18px rgba(110,80,220,0.2)}
        .plan:not(.sel):hover{border-color:rgba(110,85,200,0.5);background:rgba(25,18,52,0.7)}
        .plan-head{display:flex;align-items:center;gap:12px;padding:15px 16px}
        .plan-dot{width:17px;height:17px;border-radius:50%;border:1.5px solid rgba(130,100,210,0.5);flex-shrink:0;display:flex;align-items:center;justify-content:center}
        .plan.sel .plan-dot{background:#9070d0;border-color:#9070d0}
        .plan-dot-inner{width:7px;height:7px;border-radius:50%;background:#fff;opacity:0;transition:opacity 0.15s}
        .plan.sel .plan-dot-inner{opacity:1}
        .plan-info{flex:1;min-width:0}
        .plan-name-row{display:flex;align-items:center;gap:6px;margin-bottom:3px}
        .plan-name{font-size:15px;color:#fff;letter-spacing:0.5px}
        .badge-rec{font-family:sans-serif;font-size:9px;padding:2px 7px;border-radius:10px;background:rgba(200,168,112,0.2);color:#c8a870;border:1px solid rgba(200,168,112,0.4);letter-spacing:1px}
        .badge-dev{font-family:sans-serif;font-size:9px;padding:2px 7px;border-radius:10px;background:rgba(80,200,140,0.18);color:#70d0a0;border:1px solid rgba(100,220,160,0.35);letter-spacing:1px}
        .plan-meta{font-family:sans-serif;font-size:10px;color:rgba(255,255,255,0.4)}
        .plan-right{text-align:right;flex-shrink:0}
        .plan-price{font-family:sans-serif;font-size:17px;color:#c8a870;font-weight:700;letter-spacing:-0.5px}
        .plan-pages{font-family:sans-serif;font-size:9px;color:rgba(255,255,255,0.35);margin-top:2px;letter-spacing:0.5px}

        .plan-body{padding:0 16px 14px;border-top:1px solid rgba(90,70,170,0.18)}
        .chapter-list{display:flex;flex-direction:column;gap:6px;padding-top:12px}
        .chapter-row{display:flex;align-items:center;gap:10px}
        .ch-icon{font-family:'Noto Serif KR',serif;font-size:16px;color:#a090e0;width:24px;text-align:center;flex-shrink:0;text-shadow:0 0 8px rgba(140,110,240,0.5)}
        .ch-title{font-size:12px;color:rgba(255,255,255,0.85);letter-spacing:0.5px}
        .ch-desc{font-family:sans-serif;font-size:10px;color:rgba(255,255,255,0.35);margin-left:auto;white-space:nowrap}

        /* ── 폼 ── */
        .form-box{background:rgba(15,12,32,0.6);border:1px solid rgba(90,70,170,0.25);border-radius:10px;padding:18px 16px;margin-bottom:20px}
        .form-title{font-family:sans-serif;font-size:10px;letter-spacing:4px;color:rgba(140,110,220,0.7);margin-bottom:16px}
        .field{margin-bottom:14px}
        label{font-family:sans-serif;font-size:11px;letter-spacing:1.5px;color:rgba(180,160,240,0.65);margin-bottom:7px;display:block}
        input,select{width:100%;padding:11px 12px;background:rgba(20,16,44,0.8);border:1px solid rgba(90,70,170,0.35);border-radius:6px;color:#e8e4ff;font-family:inherit;font-size:13px;outline:none;transition:border-color 0.2s;-webkit-appearance:none}
        input:focus,select:focus{border-color:rgba(150,110,240,0.65)}
        input::placeholder{color:rgba(200,180,255,0.2)}
        .ymd{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:8px}
        .hm{grid-template-columns:1fr 1fr}
        .row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .pills{display:flex;gap:7px}
        .pill{flex:1;padding:10px;text-align:center;font-family:sans-serif;font-size:12px;border:1px solid rgba(90,70,170,0.32);background:rgba(20,16,44,0.8);color:rgba(200,180,255,0.45);border-radius:6px;cursor:pointer;transition:all 0.15s}
        .pill.on{background:rgba(110,80,210,0.28);border-color:rgba(150,110,240,0.7);color:#fff}
        .hint{font-family:sans-serif;font-size:9.5px;color:rgba(160,140,220,0.3);margin-top:5px;letter-spacing:0.3px}

        /* ── 구매 버튼 ── */
        .buy-wrap{margin-bottom:8px}
        .btn-buy{width:100%;padding:16px;background:linear-gradient(135deg,#5038b0,#6a50d0);color:#fff;border:none;border-radius:8px;font-family:'Noto Serif KR',serif;font-size:14px;letter-spacing:2px;cursor:pointer;box-shadow:0 4px 22px rgba(90,60,200,0.45);transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:8px}
        .btn-buy:disabled{opacity:0.5;cursor:wait}
        .btn-buy:not(:disabled):hover{transform:translateY(-2px);box-shadow:0 6px 26px rgba(90,60,200,0.6)}
        .btn-buy-sub{font-family:sans-serif;font-size:10px;color:rgba(255,255,255,0.5);text-align:center;margin-top:8px;letter-spacing:0.5px}
        .spin{display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.2);border-top-color:#fff;border-radius:50%;animation:sp 1s linear infinite}
        @keyframes sp{to{transform:rotate(360deg)}}

        .err{font-family:sans-serif;font-size:11px;color:#ff8090;padding:10px 14px;background:rgba(200,40,80,0.1);border:1px solid rgba(200,60,100,0.3);border-radius:6px;margin-bottom:14px}
        .done-msg{padding:14px;background:rgba(80,200,140,0.1);border:1px solid rgba(100,220,160,0.3);border-radius:8px;margin-top:12px;text-align:center;font-family:sans-serif;font-size:12px;color:#70d0a0;line-height:1.6}
        .disclaimer{margin-top:18px;font-family:sans-serif;font-size:10px;color:rgba(255,255,255,0.28);text-align:center;line-height:1.7}
      `}</style>

      <div className="app">
        <header>
          <button className="back" onClick={() => router.push("/")} aria-label="뒤로">←</button>
          <div>
            <div className="h-title">命書 · 명서</div>
            <div className="h-sub">SAJU READING PDF</div>
          </div>
        </header>

        <div className="content">

          {/* ── 히어로 ── */}
          <div className="hero">
            <div className="hero-book">
              <img src="/book-myeongseo.png" alt="명서 — 사주 정밀 풀이 PDF"/>
            </div>
            <div className="hero-tag">✦  사주 정밀 풀이 PDF  ✦</div>
            <div className="hero-hanja">命書</div>
            <div className="hero-name">명서</div>
            <div className="hero-desc">
              AI가 집필한 <strong>나만의 사주 풀이</strong>를<br/>
              아름다운 PDF 한 권으로 받아보세요<br/>
              <strong>커버 · 명식표 · 챕터별 풀이</strong> 포함
            </div>
          </div>

          {/* ── 상품 선택 ── */}
          <div className="section-label">✦ 상품 선택</div>
          <div className="plans">
            {PLANS.map(p => (
              <div
                key={p.id}
                className={`plan ${selected === p.id ? "sel" : ""}`}
                onClick={() => setSelected(p.id)}
              >
                <div className="plan-head">
                  <div className="plan-dot">
                    <div className="plan-dot-inner"/>
                  </div>
                  <div className="plan-info">
                    <div className="plan-name-row">
                      <span className="plan-name">{p.name}</span>
                      {p.rec && <span className="badge-rec">추천</span>}
                      {IS_DEV && <span className="badge-dev">DEV 무료</span>}
                    </div>
                    <div className="plan-meta">{p.chapters.length}개 챕터</div>
                  </div>
                  <div className="plan-right">
                    <div className="plan-price">{IS_DEV ? "무료" : `₩${p.price.toLocaleString()}`}</div>
                    <div className="plan-pages">{p.pages}</div>
                  </div>
                </div>

                {selected === p.id && (
                  <div className="plan-body">
                    <div className="chapter-list">
                      {p.chapters.map(ch => (
                        <div key={ch.icon} className="chapter-row">
                          <span className="ch-icon">{ch.icon}</span>
                          <span className="ch-title">{ch.title}</span>
                          <span className="ch-desc">{ch.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── 생년월일 입력 (상품 선택 후 표시) ── */}
          {selected && (
            <>
              <div className="form-box">
                <div className="form-title">✦ 생년월일 입력</div>

                {error && <div className="err">{error}</div>}

                <div className="field">
                  <label>이름</label>
                  <input value={form.name} onChange={e => update("name", e.target.value)} placeholder="홍길동" maxLength={20}/>
                </div>
                <div className="field">
                  <label>생년월일</label>
                  <div className="ymd">
                    <select value={form.year} onChange={e => update("year", e.target.value)}>
                      <option value="">년</option>
                      {years.map(y => <option key={y} value={y}>{y}년</option>)}
                    </select>
                    <select value={form.month} onChange={e => update("month", e.target.value)}>
                      <option value="">월</option>
                      {months.map(m => <option key={m} value={m}>{Number(m)}월</option>)}
                    </select>
                    <select value={form.day} onChange={e => update("day", e.target.value)}>
                      <option value="">일</option>
                      {days.map(d => <option key={d} value={d}>{Number(d)}일</option>)}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label>태어난 시간 <span style={{opacity:0.5,fontWeight:400}}>(선택)</span></label>
                  <div className="ymd hm">
                    <select value={form.hour} onChange={e => update("hour", e.target.value)}>
                      <option value="">시</option>
                      {hours.map(h => <option key={h} value={h}>{Number(h)}시</option>)}
                    </select>
                    <input
                      type="number" min={0} max={59} inputMode="numeric"
                      placeholder="분 (0~59)" value={form.minute}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g,"").slice(0,2);
                        const n = Number(v);
                        if (v===""||( n>=0&&n<=59)) update("minute",v);
                      }}
                    />
                  </div>
                </div>
                <div className="field">
                  <div className="row">
                    <div>
                      <label>성별</label>
                      <div className="pills">
                        {["여성","남성"].map(g => (
                          <div key={g} className={`pill ${form.gender===g?"on":""}`} onClick={()=>update("gender",g)}>{g}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label>달력</label>
                      <div className="pills">
                        {["양력","음력"].map(c => (
                          <div key={c} className={`pill ${form.calendar===c?"on":""}`} onClick={()=>update("calendar",c)}>{c}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="field">
                  <label>출생지 <span style={{opacity:0.5,fontWeight:400}}>(진태양시 보정)</span></label>
                  <select
                    value={form.city}
                    onChange={e => {
                      const city = CITIES.find(c => c.name===e.target.value);
                      if (city) { update("city",city.name); update("longitude",city.longitude<=0?"":String(city.longitude)); }
                    }}
                  >
                    {CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                  {form.city==="직접 입력" && (
                    <input type="number" step="0.01" min="0" max="360"
                      placeholder="경도 (예: 126.98)" value={form.longitude}
                      onChange={e=>update("longitude",e.target.value)} style={{marginTop:8}}/>
                  )}
                  <div className="hint">미선택 시 한국 표준시(KST) 기준으로 계산됩니다</div>
                </div>
              </div>

              {/* ── 구매 버튼 ── */}
              <div className="buy-wrap">
                <button
                  className="btn-buy"
                  disabled={!!loading || !hasForm}
                  onClick={purchase}
                >
                  {loading
                    ? <><span className="spin"/> {plan?.chapters.length}개 챕터 집필 중…</>
                    : `PDF 받기 · ${IS_DEV ? "무료" : plan ? `₩${plan.price.toLocaleString()}` : ""}`
                  }
                </button>
                <div className="btn-buy-sub">
                  ⏱ 생성 약 {selected==="full"?"60":"30"}초 · PDF 파일로 자동 다운로드
                </div>
              </div>

              {done && (
                <div className="done-msg">
                  ✓ PDF 다운로드 완료!<br/>
                  <span style={{opacity:0.7}}>파일이 기기에 저장되었습니다. 다른 상품도 받을 수 있어요.</span>
                </div>
              )}
            </>
          )}

          <div className="disclaimer">
            ※ 만세력 정밀 계산 + AI 해석으로 작성된 참고 자료입니다<br/>
            생성된 PDF는 이 기기에만 저장됩니다 · 법적 효력 없음
          </div>
        </div>
      </div>
    </>
  );
}
