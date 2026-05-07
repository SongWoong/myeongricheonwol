"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loadResult, saveResult } from "@/app/lib/limits";

type Stage = "profile" | "chat";

interface ProfileData {
  name: string;
  birthdate: string;
  time: string;
  gender: string;
  calendar: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  cards?: { nameKo: string; nameEn: string; image: string; reversed: boolean }[];
}

const YEARS = Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) =>
  String(new Date().getFullYear() - i)
);
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const HOURS = Array.from({ length: 25 }, (_, i) =>
  i === 0 ? "" : String(i - 1).padStart(2, "0")
);

export default function HyewonPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("profile");
  const [profile, setProfile] = useState<ProfileData>({
    name: "", birthdate: "", time: "", gender: "여성", calendar: "양력",
  });
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 저장된 사주 정보 불러오기
  useEffect(() => {
    const cached = loadResult<{ form: { name: string; year: string; month: string; day: string; hour: string; minute: string; gender: string; calendar: string } }>("saju");
    if (cached?.payload?.form) {
      const f = cached.payload.form;
      if (f.name) setProfile((p) => ({ ...p, name: f.name }));
      if (f.year) setYear(f.year);
      if (f.month) setMonth(f.month);
      if (f.day) setDay(f.day);
      if (f.hour) setHour(f.hour);
      if (f.gender) setProfile((p) => ({ ...p, gender: f.gender }));
      if (f.calendar) setProfile((p) => ({ ...p, calendar: f.calendar }));
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const daysInMonth = (() => {
    const y = Number(year), m = Number(month);
    if (!y || !m) return 31;
    return new Date(y, m, 0).getDate();
  })();
  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, "0"));

  const startChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name.trim() || !year || !month || !day) {
      setError("이름과 생년월일은 필수입니다");
      return;
    }
    const bd = `${year}-${month}-${day}`;
    const finalProfile = { ...profile, birthdate: bd, time: hour ? `${hour}:00` : "" };
    setProfile(finalProfile);
    setError("");
    setStage("chat");
    // 첫 인사 메시지
    setMessages([
      {
        role: "assistant",
        content: `안녕하세요, ${profile.name || "당신"}. 저는 혜원이에요.\n\n사주의 흐름과 타로의 직관으로 함께 이야기 나눠드릴게요. 무엇이 궁금하신가요? 연애, 직업, 재물, 건강 — 어떤 주제든 편하게 물어보세요.`,
      },
    ]);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/hyewon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          profile: profile.birthdate ? profile : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "서버 오류");
      const aiMsg: ChatMessage = {
        role: "assistant",
        content: data.result,
        cards: data.cards,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setMessages([]);
    setStage("profile");
    setError("");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;700&family=Cinzel:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;background:#000}
        body{font-family:'Noto Serif KR',Georgia,serif;display:flex;justify-content:center}
        .app{position:relative;width:100%;max-width:448px;min-height:100dvh;background:
          radial-gradient(ellipse 80% 50% at 50% 0%,rgba(180,100,200,0.2),transparent 60%),
          radial-gradient(ellipse 60% 40% at 90% 40%,rgba(120,80,200,0.15),transparent 60%),
          radial-gradient(ellipse 50% 40% at 10% 80%,rgba(80,60,180,0.15),transparent 60%),
          #06040f;
          display:flex;flex-direction:column;color:#e0d8ff}

        /* 헤더 */
        header{position:fixed;top:0;width:100%;max-width:448px;z-index:100;display:flex;align-items:center;gap:12px;padding:14px 20px;background:rgba(6,4,15,0.92);backdrop-filter:blur(12px);border-bottom:1px solid rgba(180,100,220,0.12)}
        .back{background:transparent;border:none;color:rgba(255,255,255,0.6);font-size:18px;cursor:pointer;padding:0 4px}
        .h-avatar{width:36px;height:36px;border-radius:50%;overflow:hidden;border:1.5px solid rgba(180,120,240,0.5);flex-shrink:0}
        .h-avatar img{width:100%;height:100%;object-fit:cover;object-position:center 10%}
        .h-info{flex:1}
        .h-name{font-size:15px;color:#fff;letter-spacing:2px}
        .h-sub{font-family:sans-serif;font-size:9px;color:rgba(220,180,255,0.6);letter-spacing:2px;margin-top:1px}
        .h-reset{background:transparent;border:1px solid rgba(180,120,240,0.3);color:rgba(220,180,255,0.7);font-family:sans-serif;font-size:10px;padding:5px 10px;border-radius:4px;cursor:pointer;letter-spacing:1px}

        /* 프로필 폼 */
        .content{flex:1;padding:74px 20px 40px;overflow-y:auto}
        .profile-intro{text-align:center;margin-bottom:28px}
        .p-avatar{width:110px;height:110px;margin:0 auto 14px;border-radius:50%;overflow:hidden;border:2px solid rgba(180,120,240,0.4);box-shadow:0 0 30px rgba(160,80,220,0.35)}
        .p-avatar img{width:100%;height:100%;object-fit:cover;object-position:center 10%}
        .p-name{font-size:22px;letter-spacing:4px;color:#fff;margin-bottom:2px}
        .p-hanja{font-size:10px;letter-spacing:6px;color:rgba(255,255,255,0.4);margin-bottom:10px}
        .p-role{font-family:sans-serif;font-size:10px;letter-spacing:3px;color:#c080e0;margin-bottom:12px}
        .p-desc{font-family:sans-serif;font-size:12px;color:rgba(255,255,255,0.6);line-height:1.75}

        form{display:flex;flex-direction:column;gap:16px}
        label{font-family:sans-serif;font-size:11px;letter-spacing:2px;color:#b090d0;margin-bottom:7px;display:block}
        input,select{width:100%;padding:11px 12px;background:rgba(15,8,35,0.8);border:1px solid rgba(140,80,200,0.25);border-radius:6px;color:#e8e0ff;font-family:inherit;font-size:13px;outline:none;transition:border-color 0.2s}
        input:focus,select:focus{border-color:rgba(180,120,250,0.6)}
        input::placeholder{color:rgba(255,255,255,0.2)}
        .ymd{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:8px}
        .ymd select{padding:11px 10px;cursor:pointer;background:rgba(15,8,35,0.8) url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3e%3cpath d='M1 1l4 4 4-4' stroke='%23c080e0' stroke-width='1.5' fill='none'/%3e%3c/svg%3e") no-repeat right 10px center;appearance:none;-webkit-appearance:none;padding-right:26px}
        .row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .pill-group{display:flex;gap:8px}
        .pill{flex:1;padding:10px;text-align:center;font-family:sans-serif;font-size:12px;border:1px solid rgba(140,80,200,0.25);background:rgba(15,8,35,0.8);color:rgba(255,255,255,0.5);border-radius:6px;cursor:pointer;transition:all 0.15s}
        .pill.on{background:rgba(160,80,220,0.2);border-color:rgba(180,120,250,0.7);color:#e0d0ff}
        .hint{font-family:sans-serif;font-size:10px;color:rgba(255,255,255,0.25);margin-top:5px}
        .err{font-family:sans-serif;font-size:11px;color:#ff7090;padding:10px;background:rgba(200,40,80,0.1);border:1px solid rgba(200,60,100,0.3);border-radius:6px}
        .submit{margin-top:8px;padding:14px;background:linear-gradient(135deg,#9040c0,#c060e0);color:#fff;border:none;border-radius:6px;font-family:'Noto Serif KR',serif;font-size:14px;letter-spacing:4px;cursor:pointer;box-shadow:0 4px 20px rgba(160,80,220,0.35);font-weight:500}

        /* 채팅 UI */
        .chat-wrap{flex:1;display:flex;flex-direction:column;padding-top:68px;padding-bottom:80px;overflow-y:auto}
        .messages{flex:1;padding:16px 16px 0;display:flex;flex-direction:column;gap:14px}

        .msg-row{display:flex;gap:10px;align-items:flex-end}
        .msg-row.user{flex-direction:row-reverse}

        .msg-avatar{width:34px;height:34px;border-radius:50%;overflow:hidden;border:1.5px solid rgba(180,120,240,0.4);flex-shrink:0}
        .msg-avatar img{width:100%;height:100%;object-fit:cover;object-position:center 10%}

        .bubble{max-width:72%;padding:12px 14px;border-radius:16px;font-size:13px;line-height:1.75;word-break:keep-all;white-space:pre-wrap}
        .bubble.ai{background:rgba(25,12,55,0.9);border:1px solid rgba(160,100,230,0.3);color:#e8e0ff;border-bottom-left-radius:4px}
        .bubble.user{background:linear-gradient(135deg,rgba(140,60,200,0.7),rgba(100,40,180,0.7));color:#fff;border-bottom-right-radius:4px}

        .cards-row{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}
        .mini-card{text-align:center;font-family:sans-serif}
        .mini-card img{width:36px;height:60px;border-radius:4px;border:1px solid rgba(180,120,240,0.4);object-fit:cover;display:block}
        .mini-card-name{font-size:9px;color:rgba(220,180,255,0.7);margin-top:3px;max-width:36px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

        .typing{padding:12px 14px;background:rgba(25,12,55,0.9);border:1px solid rgba(160,100,230,0.3);border-radius:16px;border-bottom-left-radius:4px;display:inline-flex;gap:5px;align-items:center}
        .dot{width:6px;height:6px;border-radius:50%;background:rgba(200,160,255,0.7);animation:bounce 1.2s infinite}
        .dot:nth-child(2){animation-delay:0.2s}
        .dot:nth-child(3){animation-delay:0.4s}
        @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}

        /* 입력창 */
        .chat-input-wrap{position:fixed;bottom:0;width:100%;max-width:448px;padding:10px 16px 14px;background:rgba(6,4,15,0.95);backdrop-filter:blur(12px);border-top:1px solid rgba(160,100,230,0.12);display:flex;gap:10px;align-items:flex-end;z-index:100}
        .chat-textarea{flex:1;padding:10px 14px;background:rgba(20,10,45,0.9);border:1px solid rgba(140,80,200,0.3);border-radius:20px;color:#e8e0ff;font-family:'Noto Serif KR',Georgia,serif;font-size:13px;resize:none;outline:none;min-height:42px;max-height:120px;line-height:1.5;transition:border-color 0.2s}
        .chat-textarea:focus{border-color:rgba(180,120,250,0.6)}
        .chat-textarea::placeholder{color:rgba(255,255,255,0.25)}
        .send-btn{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#9040c0,#c060e0);border:none;color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:opacity 0.2s;box-shadow:0 2px 12px rgba(160,80,220,0.4)}
        .send-btn:disabled{opacity:0.4;cursor:default}

        .err-inline{font-family:sans-serif;font-size:11px;color:#ff7090;padding:8px 16px;text-align:center}
      `}</style>

      <div className="app">
        {/* 헤더 */}
        <header>
          <button className="back" onClick={() => router.push("/")} aria-label="뒤로">←</button>
          <div className="h-avatar">
            <img src="/char-hyewon.png" alt="혜원" onError={(e) => { (e.target as HTMLImageElement).src = "/char-wolryeong.png"; }} />
          </div>
          <div className="h-info">
            <div className="h-name">혜원 · 慧源</div>
            <div className="h-sub">사주 · 타로 통합 상담</div>
          </div>
          {stage === "chat" && (
            <button className="h-reset" onClick={resetChat}>다시 시작</button>
          )}
        </header>

        {/* 프로필 입력 */}
        {stage === "profile" && (
          <div className="content">
            <div className="profile-intro">
              <div className="p-avatar">
                <img src="/char-hyewon.png" alt="혜원" onError={(e) => { (e.target as HTMLImageElement).src = "/char-wolryeong.png"; }} />
              </div>
              <div className="p-name">혜원</div>
              <div className="p-hanja">慧源</div>
              <div className="p-role">사주 · 타로 통합 상담사</div>
              <div className="p-desc">
                사주의 흐름과 타로의 직관으로<br />
                무엇이든 함께 이야기 나눠드릴게요.<br />
                먼저 간단히 알려주세요.
              </div>
            </div>
            <form onSubmit={startChat}>
              <div>
                <label>이름</label>
                <input
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  placeholder="홍길동"
                  maxLength={20}
                />
              </div>
              <div>
                <label>생년월일</label>
                <div className="ymd">
                  <select value={year} onChange={(e) => setYear(e.target.value)}>
                    <option value="">년</option>
                    {YEARS.map((y) => <option key={y} value={y}>{y}년</option>)}
                  </select>
                  <select value={month} onChange={(e) => setMonth(e.target.value)}>
                    <option value="">월</option>
                    {MONTHS.map((m) => <option key={m} value={m}>{Number(m)}월</option>)}
                  </select>
                  <select value={day} onChange={(e) => setDay(e.target.value)}>
                    <option value="">일</option>
                    {days.map((d) => <option key={d} value={d}>{Number(d)}일</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label>태어난 시간 (선택)</label>
                <select value={hour} onChange={(e) => setHour(e.target.value)}>
                  <option value="">시</option>
                  {HOURS.filter((h) => h !== "").map((h) => (
                    <option key={h} value={h}>{Number(h)}시</option>
                  ))}
                </select>
                <div className="hint">모르시면 비워두세요</div>
              </div>
              <div className="row">
                <div>
                  <label>성별</label>
                  <div className="pill-group">
                    {["여성", "남성"].map((g) => (
                      <div key={g} className={`pill ${profile.gender === g ? "on" : ""}`} onClick={() => setProfile((p) => ({ ...p, gender: g }))}>{g}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <label>달력</label>
                  <div className="pill-group">
                    {["양력", "음력"].map((c) => (
                      <div key={c} className={`pill ${profile.calendar === c ? "on" : ""}`} onClick={() => setProfile((p) => ({ ...p, calendar: c }))}>{c}</div>
                    ))}
                  </div>
                </div>
              </div>
              {error && <div className="err">{error}</div>}
              <button type="submit" className="submit">혜원과 상담 시작하기</button>
            </form>
          </div>
        )}

        {/* 채팅 */}
        {stage === "chat" && (
          <>
            <div className="chat-wrap">
              <div className="messages">
                {messages.map((msg, i) => (
                  <div key={i} className={`msg-row ${msg.role === "user" ? "user" : ""}`}>
                    {msg.role === "assistant" && (
                      <div className="msg-avatar">
                        <img src="/char-hyewon.png" alt="혜원" onError={(e) => { (e.target as HTMLImageElement).src = "/char-wolryeong.png"; }} />
                      </div>
                    )}
                    <div>
                      <div className={`bubble ${msg.role === "assistant" ? "ai" : "user"}`}>
                        {msg.content}
                      </div>
                      {msg.role === "assistant" && msg.cards && msg.cards.length > 0 && (
                        <div className="cards-row">
                          {msg.cards.slice(0, 3).map((card, ci) => (
                            <div key={ci} className="mini-card">
                              <img
                                src={card.image}
                                alt={card.nameKo}
                                style={{ filter: card.reversed ? "rotate(180deg)" : "none" }}
                              />
                              <div className="mini-card-name">{card.nameKo}{card.reversed ? "(역)" : ""}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="msg-row">
                    <div className="msg-avatar">
                      <img src="/char-hyewon.png" alt="혜원" onError={(e) => { (e.target as HTMLImageElement).src = "/char-wolryeong.png"; }} />
                    </div>
                    <div className="typing">
                      <span className="dot" /><span className="dot" /><span className="dot" />
                    </div>
                  </div>
                )}
                {error && <div className="err-inline">{error}</div>}
                <div ref={bottomRef} />
              </div>
            </div>
            <div className="chat-input-wrap">
              <textarea
                ref={inputRef}
                className="chat-textarea"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="무엇이든 물어보세요…"
                rows={1}
              />
              <button
                className="send-btn"
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                aria-label="전송"
              >
                ↑
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
