"use client";

import { useMemo, useState } from "react";
import Preview from "./Preview";
import { generateHtml } from "./generate";
import { defaultConfig, type BuilderConfig, type ServiceItem } from "./types";

export default function BuilderPage() {
  const [cfg, setCfg] = useState<BuilderConfig>(defaultConfig);
  const html = useMemo(() => generateHtml(cfg), [cfg]);

  const update = <K extends keyof BuilderConfig>(key: K, value: BuilderConfig[K]) =>
    setCfg((prev) => ({ ...prev, [key]: value }));

  const updateService = (id: string, patch: Partial<ServiceItem>) =>
    setCfg((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));

  const addService = () =>
    setCfg((prev) => ({
      ...prev,
      services: [
        ...prev.services,
        {
          id: `s${Date.now()}`,
          icon: "✦",
          title: "새 서비스",
          desc: "설명을 입력하세요",
        },
      ],
    }));

  const removeService = (id: string) =>
    setCfg((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id),
    }));

  const downloadHtml = () => {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = cfg.brandName.replace(/[^\w가-힣-]/g, "_") || "site";
    a.download = `${safeName}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(html);
      alert("HTML이 클립보드에 복사되었습니다.");
    } catch {
      alert("복사에 실패했습니다.");
    }
  };

  return (
    <div className="builder">
      <style>{css}</style>

      <aside className="panel">
        <div className="panel-header">
          <h2>홈페이지 빌더</h2>
          <p>입력하면 오른쪽에 실시간으로 반영됩니다</p>
        </div>

        <Section title="브랜드">
          <Field label="브랜드명">
            <input
              value={cfg.brandName}
              onChange={(e) => update("brandName", e.target.value)}
            />
          </Field>
        </Section>

        <Section title="히어로 섹션">
          <Field label="상단 태그">
            <input
              value={cfg.heroTag}
              onChange={(e) => update("heroTag", e.target.value)}
            />
          </Field>
          <Field label="메인 제목">
            <input
              value={cfg.heroTitle}
              onChange={(e) => update("heroTitle", e.target.value)}
            />
          </Field>
          <Field label="강조 문구 (컬러)">
            <input
              value={cfg.heroHighlight}
              onChange={(e) => update("heroHighlight", e.target.value)}
            />
          </Field>
          <Field label="서브 텍스트">
            <textarea
              rows={3}
              value={cfg.heroSub}
              onChange={(e) => update("heroSub", e.target.value)}
            />
          </Field>
          <div className="row">
            <Field label="메인 버튼">
              <input
                value={cfg.ctaText}
                onChange={(e) => update("ctaText", e.target.value)}
              />
            </Field>
            <Field label="보조 버튼">
              <input
                value={cfg.ctaSubText}
                onChange={(e) => update("ctaSubText", e.target.value)}
              />
            </Field>
          </div>
        </Section>

        <Section title="컬러">
          <div className="row">
            <Field label="포인트">
              <input
                type="color"
                value={cfg.primaryColor}
                onChange={(e) => update("primaryColor", e.target.value)}
              />
            </Field>
            <Field label="배경">
              <input
                type="color"
                value={cfg.bgColor}
                onChange={(e) => update("bgColor", e.target.value)}
              />
            </Field>
            <Field label="텍스트">
              <input
                type="color"
                value={cfg.textColor}
                onChange={(e) => update("textColor", e.target.value)}
              />
            </Field>
          </div>
        </Section>

        <Section title="서비스">
          <Field label="섹션 제목">
            <input
              value={cfg.serviceSectionTitle}
              onChange={(e) => update("serviceSectionTitle", e.target.value)}
            />
          </Field>
          {cfg.services.map((s) => (
            <div key={s.id} className="service-block">
              <div className="service-head">
                <input
                  className="icon-input"
                  value={s.icon}
                  onChange={(e) => updateService(s.id, { icon: e.target.value })}
                  aria-label="아이콘"
                />
                <input
                  value={s.title}
                  onChange={(e) => updateService(s.id, { title: e.target.value })}
                  placeholder="제목"
                />
                <button className="btn-remove" onClick={() => removeService(s.id)}>
                  ×
                </button>
              </div>
              <textarea
                rows={2}
                value={s.desc}
                onChange={(e) => updateService(s.id, { desc: e.target.value })}
                placeholder="설명"
              />
            </div>
          ))}
          <button className="btn-add" onClick={addService}>
            + 서비스 추가
          </button>
        </Section>

        <Section title="푸터">
          <Field label="푸터 텍스트">
            <input
              value={cfg.footerText}
              onChange={(e) => update("footerText", e.target.value)}
            />
          </Field>
        </Section>

        <div className="actions">
          <button className="btn-main" onClick={downloadHtml}>
            📥 HTML 다운로드
          </button>
          <button className="btn-sub" onClick={copyHtml}>
            📋 코드 복사
          </button>
        </div>
      </aside>

      <main className="preview-area">
        <div className="preview-bar">
          <span className="dot dot-r" />
          <span className="dot dot-y" />
          <span className="dot dot-g" />
          <span className="preview-url">preview.html</span>
        </div>
        <div className="preview-frame">
          <Preview html={html} />
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="section">
      <div className="section-title">{title}</div>
      <div className="section-body">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

const css = `
  .builder {
    display: grid;
    grid-template-columns: 420px 1fr;
    height: 100vh;
    background: #0a0a12;
    color: #e8e0cc;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .panel {
    overflow-y: auto;
    border-right: 1px solid rgba(255,255,255,0.08);
    padding: 24px;
    background: #0e0e18;
  }
  .panel-header { margin-bottom: 20px; }
  .panel-header h2 { font-size: 18px; color: #fff; margin-bottom: 4px; font-weight: 600; }
  .panel-header p { font-size: 12px; color: rgba(255,255,255,0.4); }
  .section {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .section-title {
    font-size: 11px; letter-spacing: 2px; color: #6090d0;
    margin-bottom: 10px; text-transform: uppercase; font-weight: 600;
  }
  .section-body { display: flex; flex-direction: column; gap: 10px; }
  .field { display: flex; flex-direction: column; gap: 5px; flex: 1; }
  .field > span {
    font-size: 11px; color: rgba(255,255,255,0.5); letter-spacing: 0.5px;
  }
  .field input, .field textarea, .service-block input, .service-block textarea {
    background: #1a1a24;
    border: 1px solid rgba(255,255,255,0.08);
    color: #e8e0cc;
    padding: 8px 10px;
    border-radius: 4px;
    font-size: 13px;
    font-family: inherit;
    outline: none;
    width: 100%;
  }
  .field input:focus, .field textarea:focus,
  .service-block input:focus, .service-block textarea:focus {
    border-color: #3c82ff;
  }
  .field input[type="color"] {
    height: 36px; padding: 2px; cursor: pointer;
  }
  .field textarea { resize: vertical; }
  .row { display: flex; gap: 8px; }
  .row > .field { min-width: 0; }
  .service-block {
    background: #15151f;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 6px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .service-head { display: flex; gap: 6px; align-items: center; }
  .icon-input { width: 42px !important; text-align: center; }
  .btn-remove {
    width: 28px; height: 28px;
    background: rgba(220,60,60,0.15);
    color: #ff8080;
    border: 1px solid rgba(220,60,60,0.3);
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    flex-shrink: 0;
  }
  .btn-remove:hover { background: rgba(220,60,60,0.3); }
  .btn-add {
    background: transparent;
    border: 1px dashed rgba(255,255,255,0.15);
    color: rgba(255,255,255,0.55);
    padding: 9px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-family: inherit;
  }
  .btn-add:hover { border-color: #3c82ff; color: #90b8e0; }
  .actions {
    display: flex; gap: 8px;
    position: sticky; bottom: -24px;
    margin: 20px -24px -24px;
    padding: 16px 24px;
    background: #0e0e18;
    border-top: 1px solid rgba(255,255,255,0.08);
  }
  .btn-main {
    flex: 1;
    background: #3c82ff;
    color: #fff;
    border: none;
    padding: 11px;
    border-radius: 5px;
    font-weight: 600;
    cursor: pointer;
    font-size: 13px;
    font-family: inherit;
  }
  .btn-main:hover { background: #5596ff; }
  .btn-sub {
    background: transparent;
    color: rgba(255,255,255,0.7);
    border: 1px solid rgba(255,255,255,0.15);
    padding: 11px 16px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 13px;
    font-family: inherit;
  }
  .btn-sub:hover { border-color: rgba(255,255,255,0.35); color: #fff; }
  .preview-area {
    display: flex; flex-direction: column;
    background: #15151f; padding: 16px;
    overflow: hidden;
  }
  .preview-bar {
    display: flex; align-items: center; gap: 6px;
    padding: 10px 14px;
    background: #1f1f2c;
    border-radius: 6px 6px 0 0;
    border: 1px solid rgba(255,255,255,0.06);
    border-bottom: none;
  }
  .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
  .dot-r { background: #ff5f56; }
  .dot-y { background: #ffbd2e; }
  .dot-g { background: #27c93f; }
  .preview-url {
    margin-left: 10px;
    font-size: 11px;
    color: rgba(255,255,255,0.4);
    letter-spacing: 0.3px;
  }
  .preview-frame {
    flex: 1;
    border: 1px solid rgba(255,255,255,0.06);
    border-top: none;
    border-radius: 0 0 6px 6px;
    overflow: hidden;
  }
  @media (max-width: 900px) {
    .builder { grid-template-columns: 1fr; grid-template-rows: auto 60vh; }
    .panel { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.08); }
  }
`;
