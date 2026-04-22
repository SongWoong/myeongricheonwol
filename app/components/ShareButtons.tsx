"use client";
import { useState } from "react";

interface ShareButtonsProps {
  title: string;          // X 공유 시 본문 (예: "나의 사주 총평 by 명리천월")
  accent?: string;        // 페이지별 강조색
  className?: string;
}

export function ShareButtons({ title, accent = "#a090e0", className }: ShareButtonsProps) {
  const [toast, setToast] = useState<string>("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  };

  const copyLink = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      await navigator.clipboard.writeText(url);
      showToast("링크를 복사했어요");
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      try { document.execCommand("copy"); showToast("링크를 복사했어요"); }
      catch { showToast("복사에 실패했어요"); }
      document.body.removeChild(textarea);
    }
  };

  const shareToX = () => {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    const tweet = `${title}\n${url}\n#명리천월`;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(tweet)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={`share-wrap ${className || ""}`} style={{ ["--accent" as string]: accent } as React.CSSProperties}>
      <style>{`
        .share-wrap{margin-top:18px;padding:14px;border:1px solid rgba(160,160,200,0.18);border-radius:8px;background:rgba(10,8,30,0.4);text-align:center;position:relative}
        .share-label{font-family:sans-serif;font-size:10px;letter-spacing:3px;color:rgba(255,255,255,0.5);margin-bottom:10px}
        .share-buttons{display:flex;gap:8px;justify-content:center}
        .share-btn{flex:1;max-width:140px;padding:10px 8px;font-family:sans-serif;font-size:12px;background:rgba(20,16,40,0.8);border:1px solid var(--accent,#a090e0);color:var(--accent,#a090e0);border-radius:6px;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center;gap:6px;letter-spacing:0.5px}
        .share-btn:hover{background:var(--accent,#a090e0);color:#0a0816}
        .share-toast{position:absolute;bottom:-32px;left:50%;transform:translateX(-50%);padding:6px 12px;background:rgba(20,16,40,0.95);border:1px solid var(--accent,#a090e0);color:var(--accent,#a090e0);border-radius:4px;font-family:sans-serif;font-size:11px;white-space:nowrap;animation:fadeIn 0.2s ease-out;z-index:10}
        @keyframes fadeIn{from{opacity:0;transform:translate(-50%,-4px)}to{opacity:1;transform:translateX(-50%)}}
      `}</style>
      <div className="share-label">함께 보기</div>
      <div className="share-buttons">
        <button className="share-btn" onClick={copyLink} type="button">
          🔗 링크 복사
        </button>
        <button className="share-btn" onClick={shareToX} type="button">
          𝕏 공유
        </button>
      </div>
      {toast && <div className="share-toast">{toast}</div>}
    </div>
  );
}
