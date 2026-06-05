"use client";
import { useState } from "react";

interface ShareButtonsProps {
  title: string;
  accent?: string;
  className?: string;
}

export function ShareButtons({ title, accent = "#a090e0", className }: ShareButtonsProps) {
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const getUrl = () => typeof window !== "undefined" ? window.location.href : "";
  const getOrigin = () => typeof window !== "undefined" ? window.location.origin : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      showToast("링크 복사 완료!");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = getUrl();
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); showToast("링크 복사 완료!"); }
      catch { showToast("복사에 실패했어요"); }
      document.body.removeChild(ta);
    }
  };

  const shareToX = () => {
    const text = `${title}\n${getOrigin()}\n#명리천월 #사주 #운세`;
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank", "noopener,noreferrer"
    );
  };

  const shareToThreads = () => {
    const text = `${title}\n${getOrigin()}\n#명리천월 #사주 #운세`;
    window.open(
      `https://www.threads.net/intent/post?text=${encodeURIComponent(text)}`,
      "_blank", "noopener,noreferrer"
    );
  };

  const shareToInstagram = async () => {
    // 모바일: 네이티브 공유시트 → 인스타그램 선택 가능
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "명리천월",
          text: title,
          url: getOrigin(),
        });
      } catch {
        // 사용자가 취소한 경우 무시
      }
    } else {
      // 데스크톱: 링크 복사 후 안내
      try { await navigator.clipboard.writeText(getOrigin()); } catch {}
      showToast("링크를 복사했어요. 인스타에 붙여넣기 하세요 📋");
    }
  };

  return (
    <div
      className={`share-wrap ${className || ""}`}
      style={{ ["--accent" as string]: accent } as React.CSSProperties}
    >
      <style>{`
        .share-wrap{margin-top:18px;padding:14px 12px;border:1px solid rgba(160,160,200,0.18);border-radius:8px;background:rgba(10,8,30,0.4);text-align:center;position:relative}
        .share-label{font-family:sans-serif;font-size:10px;letter-spacing:3px;color:rgba(255,255,255,0.5);margin-bottom:10px}
        .share-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .share-btn{padding:10px 6px;font-family:sans-serif;font-size:11.5px;background:rgba(20,16,40,0.8);border:1px solid var(--accent,#a090e0);color:var(--accent,#a090e0);border-radius:6px;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center;gap:5px;letter-spacing:0.3px;white-space:nowrap}
        .share-btn:hover{background:var(--accent,#a090e0);color:#0a0816}
        .share-btn:active{transform:scale(0.97)}
        .share-toast{position:absolute;bottom:-36px;left:50%;transform:translateX(-50%);padding:6px 14px;background:rgba(20,16,40,0.97);border:1px solid var(--accent,#a090e0);color:var(--accent,#a090e0);border-radius:4px;font-family:sans-serif;font-size:11px;white-space:nowrap;animation:fadeIn 0.2s ease-out;z-index:10}
        @keyframes fadeIn{from{opacity:0;transform:translate(-50%,-4px)}to{opacity:1;transform:translateX(-50%)}}
      `}</style>

      <div className="share-label">풀이 공유하기</div>
      <div className="share-grid">
        <button className="share-btn" onClick={copyLink} type="button">
          🔗 링크 복사
        </button>
        <button className="share-btn" onClick={shareToX} type="button">
          𝕏 공유
        </button>
        <button className="share-btn" onClick={shareToInstagram} type="button">
          📸 인스타그램
        </button>
        <button className="share-btn" onClick={shareToThreads} type="button">
          🧵 스레드
        </button>
      </div>

      {toast && <div className="share-toast">{toast}</div>}
    </div>
  );
}
