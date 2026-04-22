"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SAJU_CHAPTERS } from "@/app/lib/saju-chapters";
import { JAMI_CHAPTERS } from "@/app/lib/jami-chapters";
import { MILSEO_CHAPTERS } from "@/app/lib/milseo-chapters";

interface SavedItem {
  groupId: "saju" | "jami" | "milseo" | "today" | "tojeong";
  groupLabel: string;
  groupIcon: string;
  chapterId?: string;
  chapterIcon: string;
  chapterTitle: string;
  preview: string;
  savedAt: number;
  targetPath: string;
}

const previewOf = (text: string): string => {
  if (!text) return "(내용 없음)";
  const clean = text.replace(/\n+/g, " ").replace(/✦/g, "").replace(/\s+/g, " ").trim();
  return clean.length > 60 ? clean.slice(0, 60) + "…" : clean;
};

const dateFmt = (ms: number): string => {
  const d = new Date(ms);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const diffDays = Math.floor((now.getTime() - ms) / 86400000);
  if (sameDay) return `오늘 ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  if (diffDays === 1) return "어제";
  if (diffDays < 7) return `${diffDays}일 전`;
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
};

const readJSON = (key: string): { savedAt: number; payload: unknown } | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export default function ReplayPage() {
  const router = useRouter();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const list: SavedItem[] = [];

    // 사주 (챕터별)
    const saju = readJSON("result_saju_v2");
    if (saju?.payload) {
      const p = saju.payload as { chapters?: Record<string, string>; form?: { name?: string } };
      Object.entries(p.chapters || {}).forEach(([cid, text]) => {
        const ch = SAJU_CHAPTERS.find((c) => c.id === cid);
        if (!ch || !text) return;
        list.push({
          groupId: "saju", groupLabel: "자운 · 사주", groupIcon: "紫",
          chapterId: cid, chapterIcon: ch.icon, chapterTitle: `${p.form?.name ? p.form.name + "의 " : ""}${ch.title}`,
          preview: previewOf(text),
          savedAt: saju.savedAt,
          targetPath: "/saju",
        });
      });
    }

    // 자미두수 (챕터별)
    const jami = readJSON("result_jami_v2");
    if (jami?.payload) {
      const p = jami.payload as { chapters?: Record<string, string>; form?: { name?: string } };
      Object.entries(p.chapters || {}).forEach(([cid, text]) => {
        const ch = JAMI_CHAPTERS.find((c) => c.id === cid);
        if (!ch || !text) return;
        list.push({
          groupId: "jami", groupLabel: "성연 · 자미두수", groupIcon: "星",
          chapterId: cid, chapterIcon: ch.icon, chapterTitle: `${p.form?.name ? p.form.name + "의 " : ""}${ch.title}`,
          preview: previewOf(text),
          savedAt: jami.savedAt,
          targetPath: "/jami",
        });
      });
    }

    // 밀서 (챕터별)
    const milseo = readJSON("result_milseo_v2");
    if (milseo?.payload) {
      const p = milseo.payload as { chapters?: Record<string, string>; form?: { name?: string } };
      Object.entries(p.chapters || {}).forEach(([cid, text]) => {
        const ch = MILSEO_CHAPTERS.find((c) => c.id === cid);
        if (!ch || !text) return;
        list.push({
          groupId: "milseo", groupLabel: "밀서 · 19+", groupIcon: "密",
          chapterId: cid, chapterIcon: ch.icon, chapterTitle: `${p.form?.name ? p.form.name + "의 " : ""}${ch.title}`,
          preview: previewOf(text),
          savedAt: milseo.savedAt,
          targetPath: "/milseo",
        });
      });
    }

    // 오늘운세
    const today = readJSON("result_today_v2");
    if (today?.payload) {
      const p = today.payload as { result?: string; form?: { name?: string } };
      if (p.result) {
        list.push({
          groupId: "today", groupLabel: "오늘운세", groupIcon: "日",
          chapterIcon: "日", chapterTitle: `${p.form?.name ? p.form.name + "의 " : ""}오늘운세`,
          preview: previewOf(p.result),
          savedAt: today.savedAt,
          targetPath: "/today",
        });
      }
    }

    // 토정비결
    const tojeong = readJSON("result_tojeong_v2");
    if (tojeong?.payload) {
      const p = tojeong.payload as { result?: string; form?: { name?: string }; year?: number };
      if (p.result) {
        list.push({
          groupId: "tojeong", groupLabel: "토정비결", groupIcon: "秘",
          chapterIcon: "秘", chapterTitle: `${p.form?.name ? p.form.name + "의 " : ""}${p.year || ""} 토정비결`,
          preview: previewOf(p.result),
          savedAt: tojeong.savedAt,
          targetPath: "/tojeong",
        });
      }
    }

    list.sort((a, b) => b.savedAt - a.savedAt);
    setItems(list);
    setLoaded(true);
  }, []);

  const groupedCount = items.reduce<Record<string, number>>((acc, it) => {
    acc[it.groupId] = (acc[it.groupId] || 0) + 1;
    return acc;
  }, {});

  const clearItem = (item: SavedItem) => {
    if (!confirm(`'${item.chapterTitle}' 풀이를 삭제할까요?\n(해당 페이지의 캐시가 지워집니다)`)) return;
    try {
      if (item.groupId === "saju" || item.groupId === "jami" || item.groupId === "milseo") {
        const key = `result_${item.groupId}_v2`;
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (item.chapterId && parsed.payload?.chapters) {
            delete parsed.payload.chapters[item.chapterId];
            localStorage.setItem(key, JSON.stringify(parsed));
          }
        }
      } else {
        localStorage.removeItem(`result_${item.groupId}_v2`);
      }
      setItems((prev) => prev.filter((x) => !(x.groupId === item.groupId && x.chapterId === item.chapterId)));
    } catch {}
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;700&family=Cinzel:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;background:#000}
        body{font-family:'Noto Serif KR',Georgia,serif;display:flex;justify-content:center}
        .app{position:relative;width:100%;max-width:448px;min-height:100dvh;background:
          radial-gradient(ellipse 80% 50% at 50% 0%,rgba(112,96,224,0.18),transparent 60%),
          radial-gradient(ellipse 60% 40% at 10% 80%,rgba(80,140,220,0.15),transparent 60%),
          #080614;
          display:flex;flex-direction:column;color:#dcdce8}
        header{position:fixed;top:0;width:100%;max-width:448px;z-index:100;display:flex;align-items:center;gap:12px;padding:14px 20px;background:rgba(8,6,20,0.92);backdrop-filter:blur(10px);border-bottom:1px solid rgba(120,140,200,0.12)}
        .back{background:transparent;border:none;color:rgba(255,255,255,0.7);font-size:18px;cursor:pointer;padding:0 4px}
        .h-title{font-family:'Cinzel','Noto Serif KR',serif;color:#fff;font-size:15px;letter-spacing:3px;font-weight:500}
        .h-sub{font-family:sans-serif;font-size:8px;color:rgba(255,255,255,0.35);letter-spacing:2px;margin-top:2px}
        .content{flex:1;padding:74px 16px 40px;overflow-y:auto}

        .hero{text-align:center;margin-bottom:26px}
        .hero-icon{font-family:'Noto Serif KR',serif;font-size:42px;color:#a090e0;text-shadow:0 0 20px rgba(160,120,240,0.5);margin-bottom:8px;font-weight:500}
        .hero-title{font-size:18px;color:#fff;letter-spacing:3px;margin-bottom:4px}
        .hero-desc{font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.5);letter-spacing:0.5px}

        .empty{padding:60px 20px;text-align:center}
        .empty-icon{font-family:'Noto Serif KR',serif;font-size:36px;color:rgba(160,160,200,0.3);margin-bottom:14px}
        .empty-title{font-size:14px;color:rgba(255,255,255,0.7);letter-spacing:2px;margin-bottom:8px}
        .empty-desc{font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.4);line-height:1.7;margin-bottom:24px}
        .empty-cta{display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#7060e0,#9040c0);color:#fff;border:none;border-radius:4px;font-family:'Noto Serif KR',serif;font-size:12px;letter-spacing:3px;cursor:pointer;text-decoration:none}

        .group{margin-bottom:22px}
        .group-head{display:flex;align-items:center;gap:8px;padding:8px 4px;margin-bottom:8px}
        .group-icon{font-family:'Noto Serif KR',serif;font-size:20px;color:#a090e0;width:28px;text-align:center;font-weight:500;text-shadow:0 0 10px rgba(160,120,240,0.4)}
        .group-label{font-family:sans-serif;font-size:12px;letter-spacing:2px;color:rgba(255,255,255,0.8);font-weight:500}
        .group-count{font-family:sans-serif;font-size:10px;color:rgba(160,140,240,0.7);letter-spacing:1px;margin-left:auto}

        .item{display:flex;align-items:center;gap:12px;padding:14px;background:rgba(20,16,40,0.55);border:1px solid rgba(120,100,200,0.22);border-radius:8px;cursor:pointer;margin-bottom:8px;transition:all 0.15s;position:relative}
        .item:hover{background:rgba(40,30,70,0.7);border-color:rgba(160,120,240,0.45)}
        .item-icon{font-family:'Noto Serif KR',serif;font-size:24px;width:36px;text-align:center;color:#c0a8e8;text-shadow:0 0 10px rgba(160,120,240,0.5);flex-shrink:0;font-weight:500}
        .item-body{flex:1;min-width:0}
        .item-title{font-size:13px;color:#fff;letter-spacing:0.5px;margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .item-preview{font-family:sans-serif;font-size:10.5px;color:rgba(255,255,255,0.45);line-height:1.4;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
        .item-meta{display:flex;align-items:center;gap:6px;margin-top:5px}
        .item-date{font-family:sans-serif;font-size:9px;color:rgba(160,140,240,0.65);letter-spacing:0.5px}
        .item-del{background:transparent;border:none;color:rgba(255,120,120,0.45);font-size:14px;cursor:pointer;padding:4px;margin-left:4px;flex-shrink:0}
        .item-del:hover{color:#ff9090}

        .disclaimer{margin-top:22px;font-family:sans-serif;font-size:10px;color:rgba(255,255,255,0.35);text-align:center;line-height:1.6;padding:0 10px}
      `}</style>
      <div className="app">
        <header>
          <button className="back" onClick={() => router.push("/")} aria-label="뒤로">←</button>
          <div>
            <div className="h-title">보관함</div>
            <div className="h-sub">MY READINGS</div>
          </div>
        </header>
        <div className="content">
          <div className="hero">
            <div className="hero-icon">藏</div>
            <div className="hero-title">보관함</div>
            <div className="hero-desc">그대가 받으셨던 풀이들</div>
          </div>

          {loaded && items.length === 0 && (
            <div className="empty">
              <div className="empty-icon">空</div>
              <div className="empty-title">아직 풀이 기록이 없어요</div>
              <div className="empty-desc">
                자운·월령·성연·밀서 중 한 분을 찾아가<br/>
                첫 풀이를 받아보세요
              </div>
              <button className="empty-cta" onClick={() => router.push("/")}>풀이 받으러 가기</button>
            </div>
          )}

          {items.length > 0 && (() => {
            const groupedItems: Record<string, SavedItem[]> = {};
            items.forEach((it) => {
              if (!groupedItems[it.groupId]) groupedItems[it.groupId] = [];
              groupedItems[it.groupId].push(it);
            });
            const order: SavedItem["groupId"][] = ["saju", "jami", "milseo", "today", "tojeong"];
            return order.filter((g) => groupedItems[g]?.length).map((gid) => {
              const group = groupedItems[gid];
              const first = group[0];
              return (
                <div key={gid} className="group">
                  <div className="group-head">
                    <span className="group-icon">{first.groupIcon}</span>
                    <span className="group-label">{first.groupLabel}</span>
                    <span className="group-count">{groupedCount[gid]}건</span>
                  </div>
                  {group.map((item) => (
                    <div key={`${item.groupId}-${item.chapterId || "single"}`} className="item" onClick={() => router.push(item.targetPath)}>
                      <div className="item-icon">{item.chapterIcon}</div>
                      <div className="item-body">
                        <div className="item-title">{item.chapterTitle}</div>
                        <div className="item-preview">{item.preview}</div>
                        <div className="item-meta">
                          <span className="item-date">{dateFmt(item.savedAt)}</span>
                        </div>
                      </div>
                      <button className="item-del" aria-label="삭제" onClick={(e) => { e.stopPropagation(); clearItem(item); }}>×</button>
                    </div>
                  ))}
                </div>
              );
            });
          })()}

          {items.length > 0 && (
            <div className="disclaimer">
              ※ 풀이 기록은 이 브라우저에만 저장되며<br/>
              브라우저 데이터 삭제 시 함께 지워집니다
            </div>
          )}
        </div>
      </div>
    </>
  );
}
