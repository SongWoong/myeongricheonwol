import type { BuilderConfig } from "./types";

const escape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const nl2br = (s: string) => escape(s).replace(/\n/g, "<br />");

export function generateHtml(cfg: BuilderConfig): string {
  const servicesHtml = cfg.services
    .map(
      (s) => `
      <div class="card">
        <div class="card-icon">${escape(s.icon)}</div>
        <div class="card-title">${escape(s.title)}</div>
        <div class="card-desc">${escape(s.desc)}</div>
      </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escape(cfg.brandName)}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Nanum Myeongjo', Georgia, serif;
    background: ${escape(cfg.bgColor)};
    color: ${escape(cfg.textColor)};
    overflow-x: hidden;
    min-height: 100vh;
  }
  header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 22px 40px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .logo { font-size: 20px; letter-spacing: 3px; color: #fff; }
  .btn-primary {
    padding: 10px 22px; font-size: 12px;
    background: ${escape(cfg.primaryColor)}; color: #fff;
    border: none; border-radius: 4px; cursor: pointer;
    letter-spacing: 1px; font-weight: 700;
  }
  .btn-outline {
    padding: 10px 22px; font-size: 12px;
    background: transparent; color: #fff;
    border: 1px solid rgba(255,255,255,0.3); border-radius: 4px; cursor: pointer;
    letter-spacing: 1px;
  }
  .hero {
    text-align: center; padding: 110px 20px 90px;
  }
  .hero-tag {
    font-size: 10px; letter-spacing: 6px; color: rgba(255,255,255,0.55);
    margin-bottom: 18px;
  }
  .hero h1 {
    font-size: 54px; font-weight: 400; line-height: 1.25;
    color: #fff; margin-bottom: 18px;
  }
  .hero h1 .hl { color: ${escape(cfg.primaryColor)}; }
  .hero-sub {
    font-size: 14px; line-height: 1.9;
    color: rgba(255,255,255,0.75);
    margin-bottom: 36px;
  }
  .hero-btns { display: flex; gap: 14px; justify-content: center; }
  .services { padding: 80px 40px; }
  .section-title {
    text-align: center; font-size: 22px;
    color: #fff; margin-bottom: 40px; letter-spacing: 1px;
  }
  .cards {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 18px; max-width: 1200px; margin: 0 auto;
  }
  .card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px; padding: 28px 22px;
    transition: transform 0.2s, border-color 0.2s;
  }
  .card:hover {
    transform: translateY(-4px);
    border-color: ${escape(cfg.primaryColor)};
  }
  .card-icon { font-size: 28px; margin-bottom: 14px; }
  .card-title { font-size: 17px; color: #fff; margin-bottom: 8px; }
  .card-desc {
    font-family: sans-serif; font-size: 12px;
    color: rgba(255,255,255,0.55); line-height: 1.7;
  }
  footer {
    padding: 28px 40px; text-align: center;
    border-top: 1px solid rgba(255,255,255,0.06);
    font-family: sans-serif; font-size: 11px;
    color: rgba(255,255,255,0.35); letter-spacing: 1px;
  }
  @media (max-width: 640px) {
    .hero h1 { font-size: 34px; }
    header { padding: 18px 20px; }
    .services { padding: 60px 20px; }
  }
</style>
</head>
<body>
  <header>
    <div class="logo">${escape(cfg.brandName)}</div>
    <button class="btn-primary">${escape(cfg.ctaText)}</button>
  </header>

  <section class="hero">
    <div class="hero-tag">${escape(cfg.heroTag)}</div>
    <h1>${escape(cfg.heroTitle)}<br /><span class="hl">${escape(cfg.heroHighlight)}</span></h1>
    <p class="hero-sub">${nl2br(cfg.heroSub)}</p>
    <div class="hero-btns">
      <button class="btn-primary">${escape(cfg.ctaText)}</button>
      <button class="btn-outline">${escape(cfg.ctaSubText)}</button>
    </div>
  </section>

  <section class="services">
    <div class="section-title">${escape(cfg.serviceSectionTitle)}</div>
    <div class="cards">${servicesHtml}
    </div>
  </section>

  <footer>${escape(cfg.footerText)}</footer>
</body>
</html>`;
}
