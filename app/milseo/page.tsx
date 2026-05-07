"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LIMITS, checkLimit, recordUsage, saveResult, loadResult } from "@/app/lib/limits";
import { MILSEO_CHAPTERS, type MilseoChapterDef } from "@/app/lib/milseo-chapters";
import { ShareButtons } from "@/app/components/ShareButtons";

/** 한국 주요 도시의 경도 데이터 (진태양시 보정용) */
const CITIES: { name: string; longitude: number }[] = [
  { name: "선택 안 함 (KST)", longitude: 0 },
  { name: "서울 (126.98°)", longitude: 126.98 },
  { name: "부산 (129.08°)", longitude: 129.08 },
  { name: "인천 (126.70°)", longitude: 126.70 },
  { name: "대구 (128.60°)", longitude: 128.60 },
  { name: "대전 (127.38°)", longitude: 127.38 },
  { name: "광주 (126.85°)", longitude: 126.85 },
  { name: "울산 (129.31°)", longitude: 129.31 },
  { name: "수원 (127.03°)", longitude: 127.03 },
  { name: "춘천 (127.73°)", longitude: 127.73 },
  { name: "청주 (127.49°)", longitude: 127.49 },
  { name: "전주 (127.15°)", longitude: 127.15 },
  { name: "제주 (126.53°)", longitude: 126.53 },
  { name: "평양 (125.75°)", longitude: 125.75 },
  { name: "도쿄 (139.69°)", longitude: 139.69 },
  { name: "베이징 (116.41°)", longitude: 116.41 },
  { name: "직접 입력", longitude: -1 },
];

type Stage = "gate" | "chapters" | "form";
type FormState = {
  name: string; year: string; month: string; day: string;
  hour: string; minute: string; gender: string; calendar: string;
  city: string; longitude: string;
};

const IS_DEV = process.env.NODE_ENV === "development";
const GATE_KEY = "milseo_age_verified";
const GATE_EXPIRY_HOURS = 24; // 24시간 후 재인증 필요

export default function MilseoPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  /** 카카오 로그인 시 age_range로 성인 여부 확인 */
  const kakaoAgeRange = (session?.user as { ageRange?: string } | undefined)?.ageRange;
  const kakaoAutoVerified = !!kakaoAgeRange && !["1~9", "10~14", "15~19"].includes(kakaoAgeRange);
  const [stage, setStage] = useState<Stage>("gate");
  const [error, setError] = useState("");
  const [gateError, setGateError] = useState("");
  const [gateYear, setGateYear] = useState("");
  const [gateMonth, setGateMonth] = useState("");
  const [gateDay, setGateDay] = useState("");
  const [generalLimit, setGeneralLimit] = useState(checkLimit(LIMITS.milseo));
  const [chapterResults, setChapterResults] = useState<Record<string, string>>({});
  const [loadingChapter, setLoadingChapter] = useState<string | null>(null);
  const [openChapterId, setOpenChapterId] = useState<string | null>(null);
  const [pendingChapterId, setPendingChapterId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "", year: "", month: "", day: "", hour: "", minute: "",
    gender: "여성", calendar: "양력", city: "", longitude: "",
  });

  useEffect(() => {
    setGeneralLimit(checkLimit(LIMITS.milseo));
    const cached = loadResult<{ form: FormState; chapters: Record<string, string> }>("milseo");
    if (cached?.payload?.form && cached.payload.chapters) {
      setForm(cached.payload.form);
      setChapterResults(cached.payload.chapters);
    }
    if (status === "loading") return;

    // 카카오 연령 자동 검증 or 기존 게이트 확인
    if (isLoggedIn && kakaoAutoVerified) {
      localStorage.setItem(GATE_KEY, JSON.stringify({ timestamp: Date.now(), loggedIn: true, autoAge: true }));
      setStage("chapters");
      return;
    }
    const verified = checkGateExpiry();
    setStage(verified && isLoggedIn ? "chapters" : "gate");
  }, [status, isLoggedIn, kakaoAutoVerified]);

  /** localStorage 게이트 만료 확인 (로그인 상태도 확인) */
  const checkGateExpiry = (): boolean => {
    try {
      const raw = localStorage.getItem(GATE_KEY);
      if (!raw) return false;
      const { timestamp, loggedIn } = JSON.parse(raw);
      if (!loggedIn) return false; // 로그인 없이 저장된 게이트는 무효
      const elapsed = (Date.now() - timestamp) / (1000 * 60 * 60);
      return elapsed < GATE_EXPIRY_HOURS;
    } catch {
      return false;
    }
  };

  const gateDaysInMonth = (() => {
    const y = Number(gateYear), m = Number(gateMonth);
    if (!y || !m) return 31;
    return new Date(y, m, 0).getDate();
  })();
  const gateDays = Array.from({ length: gateDaysInMonth }, (_, i) => String(i + 1).padStart(2, "0"));

  const verifyGate = () => {
    setGateError("");
    const y = Number(gateYear), m = Number(gateMonth), d = Number(gateDay);
    if (!y || !m || !d) {
      setGateError("생년월일을 모두 선택해주세요");
      return;
    }
    const birth = new Date(y, m - 1, d);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age--;

    if (age < 19) {
      setGateError(`만 ${age}세입니다. 밀서는 만 19세 이상만 이용할 수 있습니다.`);
      return;
    }
    // 인증 성공
    localStorage.setItem(GATE_KEY, JSON.stringify({ timestamp: Date.now(), loggedIn: true }));
    setStage("chapters");
  };

  const update = (k: keyof FormState, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: thisYear - 1900 + 1 }, (_, i) => String(thisYear - i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const gateYears = Array.from({ length: thisYear - 1920 + 1 }, (_, i) => String(thisYear - i));
  const gateMonths = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
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

  const submitFormThenChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !birthdate) {
      setError("이름과 생년월일은 필수입니다");
      return;
    }
    const [by, bm, bd] = birthdate.split("-").map(Number);
    const birth = new Date(by, bm - 1, bd);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    if (age < 19) {
      setError("밀서는 19세 이상만 이용 가능합니다");
      return;
    }
    setError("");
    saveResult("milseo", { form, chapters: chapterResults });
    setStage("chapters");
    if (pendingChapterId) {
      const chapter = MILSEO_CHAPTERS.find((c) => c.id === pendingChapterId);
      if (chapter) {
        const target = chapter;
        setPendingChapterId(null);
        setTimeout(() => generateChapter(target), 100);
      }
    }
  };

  const fetchChapter = async (chapter: MilseoChapterDef) => {
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

  const generateChapter = async (chapter: MilseoChapterDef) => {
    if (chapter.price === 0) {
      const fresh = checkLimit(LIMITS.milseo);
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
      const res = await fetch("/api/milseo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, birthdate, time: timeStr,
          gender: form.gender, calendar: form.calendar,
          chapterId: chapter.id,
          longitude: form.longitude ? Number(form.longitude) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `서버 오류 (${res.status})`);
      const next = { ...chapterResults, [chapter.id]: data.result };
      setChapterResults(next);
      saveResult("milseo", { form, chapters: next });
      if (chapter.price === 0) {
        recordUsage(LIMITS.milseo);
        setGeneralLimit(checkLimit(LIMITS.milseo));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoadingChapter(null);
    }
  };

  const regenerate = async (chapter: MilseoChapterDef) => {
    setError("");
    setLoadingChapter(chapter.id);
    setOpenChapterId(chapter.id);
    try {
      const res = await fetch("/api/milseo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, birthdate, time: timeStr,
          gender: form.gender, calendar: form.calendar,
          chapterId: chapter.id,
          longitude: form.longitude ? Number(form.longitude) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `서버 오류 (${res.status})`);
      const next = { ...chapterResults, [chapter.id]: data.result };
      setChapterResults(next);
      saveResult("milseo", { form, chapters: next });
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
          radial-gradient(ellipse 80% 50% at 50% 0%,rgba(192,48,96,0.22),transparent 60%),
          radial-gradient(ellipse 60% 40% at 90% 50%,rgba(140,30,80,0.18),transparent 60%),
          radial-gradient(ellipse 50% 40% at 10% 85%,rgba(80,10,50,0.18),transparent 60%),
          #100408;
          display:flex;flex-direction:column;color:#f0d8e0}
        .stars{position:absolute;inset:0;pointer-events:none;z-index:1;overflow:hidden}
        .star{position:absolute;background:#ffc0d0;border-radius:50%;animation:tw 3s ease-in-out infinite}
        @keyframes tw{0%,100%{opacity:0.25;transform:scale(1)}50%{opacity:1;transform:scale(1.4)}}
        @keyframes fl{0%,100%{transform:translate(0,0)}50%{transform:translate(8px,-12px)}}
        .glow{position:absolute;border-radius:50%;filter:blur(40px);pointer-events:none;z-index:1;animation:fl 10s ease-in-out infinite}
        header,.content{position:relative;z-index:3}
        header{position:fixed;top:0;width:100%;max-width:448px;z-index:100;display:flex;align-items:center;gap:12px;padding:14px 20px;background:rgba(16,4,8,0.92);backdrop-filter:blur(10px);border-bottom:1px solid rgba(200,80,120,0.15)}
        .back{background:transparent;border:none;color:rgba(255,220,230,0.75);font-size:18px;cursor:pointer;padding:0 4px}
        .h-title{font-family:'Cinzel','Noto Serif KR',serif;color:#fff;font-size:16px;letter-spacing:3px;text-shadow:0 0 20px rgba(220,100,140,0.5);font-weight:500}
        .h-sub{font-family:sans-serif;font-size:8px;color:rgba(255,220,230,0.4);letter-spacing:2px;margin-top:2px}
        .content{flex:1;padding:74px 20px 40px;overflow-y:auto}

        .gate{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:65vh;text-align:center;padding:0 16px}
        .gate-mark{font-family:'Noto Serif KR',serif;font-size:64px;color:#ff6080;text-shadow:0 0 30px rgba(255,80,120,0.6);margin-bottom:14px;font-weight:500}
        .gate-title{font-size:20px;color:#fff;letter-spacing:4px;margin-bottom:18px}
        .gate-warn{font-family:sans-serif;font-size:12px;line-height:1.8;color:rgba(255,220,230,0.65);margin-bottom:26px;letter-spacing:0.5px}
        .gate-warn b{color:#ff8090;font-weight:600}
        .gate-btn{padding:14px 32px;background:linear-gradient(135deg,#a02050,#c03060);color:#fff;border:none;border-radius:4px;font-family:'Noto Serif KR',serif;font-size:13px;letter-spacing:3px;cursor:pointer;font-weight:500;box-shadow:0 4px 20px rgba(192,48,96,0.4);margin-bottom:10px;width:100%;max-width:300px}
        .gate-leave{padding:10px;background:transparent;border:none;color:rgba(255,220,230,0.5);font-family:sans-serif;font-size:11px;cursor:pointer;letter-spacing:1px}
        .gate-form{margin-bottom:16px;width:100%;max-width:300px}
        .gate-label{display:block;font-family:sans-serif;font-size:11px;color:rgba(255,200,210,0.7);letter-spacing:2px;margin-bottom:8px;text-align:left}
        .gate-ymd{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:8px}
        .gate-ymd select{padding:11px 10px;background:rgba(20,8,12,0.8);border:1px solid rgba(180,60,100,0.35);border-radius:4px;color:#f0d8e0;font-family:inherit;font-size:13px;cursor:pointer;outline:none;appearance:none;-webkit-appearance:none;padding-right:24px;background-image:url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3e%3cpath d='M1 1l4 4 4-4' stroke='%23d06080' stroke-width='1.5' fill='none'/%3e%3c/svg%3e");background-repeat:no-repeat;background-position:right 8px center}
        .gate-ymd select:focus{border-color:rgba(220,100,140,0.7)}
        .gate-err{font-family:sans-serif;font-size:11px;color:#ff7090;padding:8px 12px;background:rgba(200,40,80,0.12);border:1px solid rgba(200,60,100,0.3);border-radius:4px;margin-bottom:14px;max-width:300px;width:100%;text-align:center}
        .gate-login-ok{font-family:sans-serif;font-size:12px;color:#80e0a0;padding:10px 14px;background:rgba(80,200,140,0.1);border:1px solid rgba(100,220,160,0.25);border-radius:6px;margin-bottom:18px;max-width:300px;width:100%;text-align:center;letter-spacing:0.5px}
        .gate-login-hint{font-family:sans-serif;font-size:10px;color:rgba(255,220,230,0.45);margin-top:10px;letter-spacing:0.5px}
        .gate-loading{font-family:sans-serif;font-size:12px;color:rgba(255,200,210,0.6);padding:14px 0;text-align:center;letter-spacing:1px}
        .gate-ok-big{font-size:13px !important;padding:14px !important}
        .gate-auto-text{font-size:10px;color:rgba(120,220,160,0.7);display:block;margin-top:4px}

        .intro{text-align:center;margin-bottom:24px}
        .intro-avatar{width:130px;height:130px;margin:0 auto 14px;border-radius:50%;overflow:hidden;border:2px solid rgba(192,48,96,0.5);box-shadow:0 0 30px rgba(192,48,96,0.45)}
        .intro-avatar img{width:100%;height:100%;object-fit:cover;object-position:center 15%;display:block}
        .intro-name{font-size:20px;letter-spacing:4px;color:#fff;margin-bottom:2px}
        .intro-hanja{font-size:10px;letter-spacing:6px;color:rgba(255,220,230,0.5);margin-bottom:10px}
        .intro-role{font-family:sans-serif;font-size:10px;letter-spacing:3px;color:#d06080;margin-bottom:10px}
        .intro-desc{font-family:sans-serif;font-size:11px;color:rgba(255,220,230,0.6);line-height:1.7}

        form{display:flex;flex-direction:column;gap:16px}
        label{font-family:sans-serif;font-size:12px;letter-spacing:2px;color:#e090a8;margin-bottom:8px;display:block;font-weight:500}
        input,select{width:100%;padding:11px 12px;background:rgba(20,8,12,0.7);border:1px solid rgba(180,60,100,0.3);border-radius:4px;color:#f0d8e0;font-family:inherit;font-size:13px;outline:none;transition:border-color 0.2s}
        input:focus,select:focus{border-color:rgba(220,100,140,0.7)}
        input::placeholder{color:rgba(255,220,230,0.25)}
        .ymd{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:8px}
        .ymd.hm{grid-template-columns:1fr 1fr}
        .ymd select{padding:11px 10px;cursor:pointer;background:rgba(20,8,12,0.7) url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3e%3cpath d='M1 1l4 4 4-4' stroke='%23d06080' stroke-width='1.5' fill='none'/%3e%3c/svg%3e") no-repeat right 10px center;appearance:none;-webkit-appearance:none;padding-right:26px}
        .ymd input[type="number"]{-moz-appearance:textfield}
        .ymd input[type="number"]::-webkit-outer-spin-button,.ymd input[type="number"]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
        .row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .pill-group{display:flex;gap:8px}
        .pill{flex:1;padding:10px;text-align:center;font-family:sans-serif;font-size:12px;border:1px solid rgba(180,60,100,0.3);background:rgba(20,8,12,0.7);color:rgba(255,220,230,0.55);border-radius:4px;cursor:pointer;transition:all 0.15s}
        .pill.on{background:rgba(192,48,96,0.22);border-color:rgba(220,100,140,0.7);color:#fff}
        .hint{font-family:sans-serif;font-size:10px;color:rgba(255,220,230,0.35);margin-top:6px}
        .err{font-family:sans-serif;font-size:11px;color:#ff7090;padding:10px;background:rgba(200,40,80,0.1);border:1px solid rgba(200,60,100,0.3);border-radius:4px;margin-bottom:12px}
        .submit{margin-top:10px;padding:14px;background:linear-gradient(135deg,#a02050,#c03060);color:#fff;border:none;border-radius:4px;font-family:'Noto Serif KR',serif;font-size:14px;letter-spacing:4px;cursor:pointer;box-shadow:0 4px 20px rgba(192,48,96,0.4);font-weight:500}

        .summary-bar{padding:14px 16px;background:rgba(20,8,12,0.7);border:1px solid rgba(180,60,100,0.3);border-radius:8px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:center;gap:12px}
        .summary-info{flex:1;min-width:0}
        .summary-name{font-size:15px;color:#fff;letter-spacing:1px;margin-bottom:3px}
        .summary-meta{font-family:sans-serif;font-size:10px;color:rgba(255,220,230,0.55);letter-spacing:0.5px}
        .summary-edit{padding:6px 12px;font-family:sans-serif;font-size:10px;background:transparent;border:1px solid rgba(220,120,150,0.45);color:#e8a0b8;border-radius:4px;cursor:pointer;letter-spacing:1px}

        .chapters-title{font-family:sans-serif;font-size:11px;letter-spacing:5px;color:#d06080;text-align:center;margin-bottom:6px}
        .chapters-sub{font-size:14px;color:#fff;text-align:center;letter-spacing:2px;margin-bottom:18px}

        .chapter-card{margin-bottom:10px;border:1px solid rgba(180,60,100,0.3);border-radius:8px;background:rgba(20,8,12,0.55);overflow:hidden;transition:all 0.2s}
        .chapter-card.has-result{border-color:rgba(220,100,140,0.5)}
        .chapter-head{display:flex;align-items:center;gap:12px;padding:14px;cursor:pointer;transition:background 0.15s}
        .chapter-head:hover{background:rgba(192,48,96,0.08)}
        .chapter-icon{font-family:'Noto Serif KR',serif;font-size:26px;width:42px;text-align:center;flex-shrink:0;color:#ff90b0;text-shadow:0 0 12px rgba(220,100,140,0.6);font-weight:500;letter-spacing:0}
        .chapter-info{flex:1;min-width:0}
        .chapter-title{font-size:14px;color:#fff;letter-spacing:1px;margin-bottom:2px;display:flex;align-items:center;gap:6px}
        .chapter-desc{font-family:sans-serif;font-size:10px;color:rgba(255,220,230,0.55);line-height:1.4}
        .chapter-badge{font-family:sans-serif;font-size:9px;padding:2px 8px;border-radius:10px;letter-spacing:1px;flex-shrink:0;white-space:nowrap}
        .badge-free{background:rgba(80,200,140,0.2);color:#80e0a0;border:1px solid rgba(100,220,160,0.4)}
        .badge-paid{background:rgba(220,140,80,0.18);color:#e0b070;border:1px solid rgba(220,160,100,0.4)}
        .badge-done{background:rgba(220,100,140,0.2);color:#ffa0c0;border:1px solid rgba(255,140,170,0.4)}
        .chapter-arrow{color:rgba(220,120,150,0.6);font-size:14px;transition:transform 0.2s;flex-shrink:0}
        .chapter-card.open .chapter-arrow{transform:rotate(90deg)}
        .chapter-body{padding:0 16px 16px;border-top:1px solid rgba(180,60,100,0.18);margin-top:0}
        .chapter-body-inner{padding-top:14px}
        .chapter-loading{padding:20px;text-align:center;color:#ffa0c0;font-family:sans-serif;font-size:12px;letter-spacing:2px}
        .chapter-loading-ring{display:inline-block;width:24px;height:24px;border:2px solid rgba(220,120,150,0.2);border-top-color:#ff80a0;border-radius:50%;animation:spin 1s linear infinite;vertical-align:middle;margin-right:10px}
        @keyframes spin{to{transform:rotate(360deg)}}
        .chapter-result{font-size:13px;line-height:1.85;color:#f5dce5;white-space:pre-wrap;word-break:keep-all}
        .chapter-actions{margin-top:14px;display:flex;gap:8px;justify-content:flex-end}
        .chapter-actions button{padding:7px 12px;font-family:sans-serif;font-size:10px;background:transparent;border:1px solid rgba(220,120,150,0.3);color:rgba(232,168,184,0.8);border-radius:4px;cursor:pointer;letter-spacing:1px}
        .recommend{margin-top:22px;padding:16px;background:linear-gradient(135deg,rgba(192,48,96,0.14),rgba(140,30,80,0.08));border:1px solid rgba(220,100,140,0.35);border-radius:8px}
        .recommend-title{font-family:sans-serif;font-size:10px;letter-spacing:4px;color:#ffa0c0;text-align:center;margin-bottom:4px}
        .recommend-sub{font-family:sans-serif;font-size:11px;color:rgba(255,220,230,0.55);text-align:center;margin-bottom:14px;line-height:1.5;font-style:italic}
        .recommend-list{display:flex;flex-direction:column;gap:8px}
        .recommend-card{display:flex;align-items:center;gap:10px;padding:12px;background:rgba(20,8,12,0.6);border:1px solid rgba(220,100,140,0.25);border-radius:6px;cursor:pointer;transition:all 0.15s}
        .recommend-card:hover{background:rgba(192,48,96,0.18);border-color:rgba(255,140,170,0.55)}
        .recommend-icon{font-family:'Noto Serif KR',serif;font-size:22px;color:#ff90b0;text-shadow:0 0 10px rgba(220,100,140,0.5);font-weight:500;width:32px;text-align:center;flex-shrink:0}
        .recommend-info{flex:1;min-width:0}
        .recommend-name{font-size:13px;color:#fff;letter-spacing:0.5px;margin-bottom:2px}
        .recommend-desc-sm{font-family:sans-serif;font-size:10px;color:rgba(255,220,230,0.5);line-height:1.3}
        .recommend-cta{font-family:sans-serif;font-size:10px;color:#e0b070;letter-spacing:1px;flex-shrink:0;font-weight:600}

        .disclaimer{margin-top:18px;padding:10px 12px;font-family:sans-serif;font-size:10px;color:rgba(255,220,230,0.4);background:rgba(20,8,12,0.5);border:1px dashed rgba(180,60,100,0.25);border-radius:4px;line-height:1.6;text-align:center}
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
            <span key={i} className="star" style={{top:st.t,left:st.l,width:st.s,height:st.s,animationDelay:st.d,boxShadow:`0 0 ${st.s*3}px #ffb0c8`}}/>
          ))}
        </div>
        <div className="glow" style={{top:"8%",left:"-50px",width:220,height:220,background:"rgba(192,48,96,0.28)"}}/>
        <div className="glow" style={{top:"50%",right:"-60px",width:240,height:240,background:"rgba(140,30,80,0.22)",animationDelay:"3s"}}/>
        <header>
          <button className="back" onClick={() => router.push("/")} aria-label="뒤로">←</button>
          <div>
            <div className="h-title">密書 · 밀서</div>
            <div className="h-sub">MILSEO · ADULT</div>
          </div>
        </header>
        <div className="content">
          {stage === "gate" && (
            <div className="gate">
              <div className="gate-mark">19</div>
              <div className="gate-title">성인 인증</div>
              <div className="gate-warn">
                <b>밀서(密書)는 만 19세 이상 성인 전용 콘텐츠입니다.</b><br/><br/>
                사주를 바탕으로 숨겨진 욕망 · 매력 ·<br/>
                은밀한 인연을 풀어드립니다.<br/><br/>
                <b>1차: 본인 인증</b> — 카카오/구글 로그인으로 본인 확인<br/>
                <b>2차: 연령 인증</b> — 카카오는 자동 확인, 그 외는 생년월일 입력<br/><br/>
                허위 정보 입력 시 법적 책임은 본인에게 있습니다.
              </div>
              {isLoggedIn ? (
                <>
                  {kakaoAutoVerified ? (
                    <>
                      <div className="gate-login-ok gate-ok-big">
                        ✓ {session?.user?.nickname || session?.user?.name} 님<br/>
                        <span className="gate-auto-text">카카오 인증으로 만 19세 이상 확인 완료</span>
                      </div>
                      <button className="gate-btn" onClick={verifyGate}>자동 인증 완료 · 입장</button>
                    </>
                  ) : (
                    <>
                      <div className="gate-login-ok">
                        ✓ {session?.user?.nickname || session?.user?.name || session?.user?.email} 님, 본인 인증 완료
                      </div>
                      <div className="gate-form">
                        <label className="gate-label">생년월일 (연령 확인)</label>
                        <div className="gate-ymd">
                          <select value={gateYear} onChange={(e) => setGateYear(e.target.value)}>
                            <option value="">년</option>
                            {gateYears.map((y) => <option key={y} value={y}>{y}년</option>)}
                          </select>
                          <select value={gateMonth} onChange={(e) => setGateMonth(e.target.value)}>
                            <option value="">월</option>
                            {gateMonths.map((m) => <option key={m} value={m}>{Number(m)}월</option>)}
                          </select>
                          <select value={gateDay} onChange={(e) => setGateDay(e.target.value)}>
                            <option value="">일</option>
                            {gateDays.map((d) => <option key={d} value={d}>{Number(d)}일</option>)}
                          </select>
                        </div>
                      </div>
                      {gateError && <div className="gate-err">{gateError}</div>}
                      <button className="gate-btn" onClick={verifyGate}>연령 확인 완료 · 입장</button>
                    </>
                  )}
                </>
              ) : status === "loading" ? (
                <div className="gate-loading">인증 상태 확인 중…</div>
              ) : (
                <>
                  <button className="gate-btn" onClick={() => router.push("/login?callbackUrl=/milseo")}>
                    카카오 / 구글 로그인으로 본인 인증
                  </button>
                  <p className="gate-login-hint">로그인 후 생년월일 인증을 진행합니다</p>
                </>
              )}
              <button className="gate-leave" onClick={() => router.push("/")}>← 돌아가기</button>
            </div>
          )}

          {stage === "form" && (
            <>
              <div className="intro">
                <div className="intro-avatar"><img src="/char-milseo.png" alt="밀서"/></div>
                <div className="intro-name">밀서</div>
                <div className="intro-hanja">密書</div>
                <div className="intro-role">은밀한 풀이사</div>
                <div className="intro-desc">
                  {pendingChapterId
                    ? <>그대의 사주가 있어야<br/>비밀을 들려드릴 수 있어요</>
                    : <>그대의 태어난 순간을 알려주시면<br/>숨겨진 결을 읽어드릴게요</>}
                </div>
              </div>
              <form onSubmit={submitFormThenChapter}>
                <div>
                  <label>이름</label>
                  <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="홍길동" maxLength={20} />
                </div>
                <div>
                  <label>생년월일 (19세 이상 필수)</label>
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
                  <div className="hint">시간을 알수록 더 구체적인 풀이</div>
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
                  <label>출생지 (진태양시 보정)</label>
                  <select
                    value={form.city}
                    onChange={(e) => {
                      const city = CITIES.find((c) => c.name === e.target.value);
                      if (city) {
                        update("city", city.name);
                        update("longitude", city.longitude <= 0 ? "" : String(city.longitude));
                      }
                    }}
                  >
                    {CITIES.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  {form.city === "직접 입력" && (
                    <input
                      type="number"
                      step="0.01"
                      min="0" max="360"
                      placeholder="경도 (예: 126.98)"
                      value={form.longitude}
                      onChange={(e) => update("longitude", e.target.value)}
                      style={{ marginTop: 8 }}
                    />
                  )}
                  <div className="hint">출생지 경도로 진태양시를 보정합니다 · 미선택 시 한국 표준시(KST) 사용</div>
                </div>
                {error && <div className="err">{error}</div>}
                <button type="submit" className="submit">
                  {pendingChapterId
                    ? `${MILSEO_CHAPTERS.find(c=>c.id===pendingChapterId)?.title} 풀이 받기`
                    : "저장하고 챕터로"}
                </button>
                {hasFormData && (
                  <button type="button" onClick={cancelForm} style={{padding:10,marginTop:4,background:"transparent",border:"1px solid rgba(220,120,150,0.3)",color:"rgba(232,168,184,0.7)",borderRadius:4,fontFamily:"inherit",fontSize:12,letterSpacing:2,cursor:"pointer"}}>
                    취소
                  </button>
                )}
              </form>
            </>
          )}

          {stage === "chapters" && (
            <>
              <div className="intro" style={{marginBottom:16}}>
                <div className="intro-avatar"><img src="/char-milseo.png" alt="밀서"/></div>
                <div className="intro-name">밀서</div>
                <div className="intro-hanja">密書</div>
                <div className="intro-role">은밀한 풀이사</div>
              </div>

              {hasFormData && (
                <div className="summary-bar">
                  <div className="summary-info">
                    <div className="summary-name">{form.name} 님</div>
                    <div className="summary-meta">{birthdate} · {form.calendar} · {timeStr || "시 미상"} · {form.gender}{form.city && form.city !== "선택 안 함 (KST)" ? ` · ${form.city}` : ""}</div>
                  </div>
                  <button className="summary-edit" onClick={editForm}>수정</button>
                </div>
              )}

              <div className="chapters-title">✦  S E C R E T  ✦</div>
              <div className="chapters-sub">{hasFormData ? "풀이 챕터를 선택하세요" : "원하는 챕터를 선택하면 정보를 입력해요"}</div>

              {error && <div className="err">{error}</div>}

              {MILSEO_CHAPTERS.map((ch) => {
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
                              <span className="chapter-loading-ring" />밀서가 비밀을 살피는 중…
                            </div>
                          )}
                          {!isLoading && hasResult && (
                            <>
                              <div className="chapter-result">{chapterResults[ch.id]}</div>
                              <ShareButtons title={`${form.name}의 ${ch.title} — 밀서(密書) by 명리천월`} accent="#ff90b0" />
                              {ch.recommendNext && ch.recommendNext.length > 0 && (
                                <div className="recommend">
                                  <div className="recommend-title">✦ 더 깊은 비밀 ✦</div>
                                  <div className="recommend-sub">그대도 모르는 더 은밀한 결이 남아있어요</div>
                                  <div className="recommend-list">
                                    {ch.recommendNext.map((rid) => {
                                      const rec = MILSEO_CHAPTERS.find((c) => c.id === rid);
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
                ※ 19세 이상 이용 가능 · 정통 만세력 사주를 정밀 계산 후<br />
                해석은 AI 기반으로 작성되었습니다 (참고용)
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
