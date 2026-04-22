export const LEGAL_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;700&family=Cinzel:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;background:#000}
body{font-family:'Noto Serif KR',Georgia,serif;display:flex;justify-content:center}
.app{position:relative;width:100%;max-width:448px;min-height:100dvh;background:#0a0816;display:flex;flex-direction:column;color:#dcdce8}
header{position:fixed;top:0;width:100%;max-width:448px;z-index:100;display:flex;align-items:center;gap:12px;padding:14px 20px;background:rgba(10,8,22,0.92);backdrop-filter:blur(10px);border-bottom:1px solid rgba(120,120,180,0.15)}
.back{background:transparent;border:none;color:rgba(255,255,255,0.7);font-size:18px;cursor:pointer;padding:0 4px}
.h-title{font-family:'Cinzel','Noto Serif KR',serif;color:#fff;font-size:14px;letter-spacing:3px;font-weight:500}
.h-sub{font-family:sans-serif;font-size:8px;color:rgba(255,255,255,0.35);letter-spacing:2px;margin-top:2px}
.content{flex:1;padding:74px 22px 50px;overflow-y:auto}
.doc-title{font-size:22px;color:#fff;letter-spacing:2px;margin-bottom:6px;font-weight:500;text-align:center}
.doc-sub{font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.45);letter-spacing:1px;text-align:center;margin-bottom:30px}
.section{margin-bottom:26px}
.section h2{font-family:'Noto Serif KR',serif;font-size:14px;color:#a0c0ff;letter-spacing:1px;margin-bottom:10px;font-weight:600;padding-bottom:6px;border-bottom:1px solid rgba(120,140,200,0.18)}
.section h3{font-family:sans-serif;font-size:12px;color:#dcdce8;margin-top:12px;margin-bottom:6px;font-weight:600}
.section p,.section li{font-family:sans-serif;font-size:12px;line-height:1.85;color:rgba(255,255,255,0.78);margin-bottom:6px}
.section ol,.section ul{padding-left:18px;margin:6px 0}
.section li{margin-bottom:4px}
.section strong{color:#fff}
.notice{padding:12px 14px;background:rgba(60,80,150,0.12);border-left:3px solid rgba(120,160,240,0.6);border-radius:4px;margin:14px 0;font-family:sans-serif;font-size:11.5px;line-height:1.7;color:rgba(255,255,255,0.78)}
.warn{padding:12px 14px;background:rgba(200,80,80,0.1);border-left:3px solid rgba(220,100,100,0.6);border-radius:4px;margin:14px 0;font-family:sans-serif;font-size:11.5px;line-height:1.7;color:rgba(255,200,200,0.85)}
table.terms{width:100%;border-collapse:collapse;margin:10px 0;font-family:sans-serif;font-size:11px}
table.terms th,table.terms td{padding:8px 10px;border:1px solid rgba(120,140,200,0.22);text-align:left;color:rgba(255,255,255,0.78)}
table.terms th{background:rgba(60,80,150,0.18);color:#a0c0ff;font-weight:600}
.footer-meta{margin-top:32px;padding-top:18px;border-top:1px solid rgba(120,140,200,0.15);font-family:sans-serif;font-size:10.5px;color:rgba(255,255,255,0.4);line-height:1.7;text-align:center}
.legal-nav{margin-top:22px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.legal-nav a{font-family:sans-serif;font-size:11px;color:rgba(160,180,240,0.7);text-decoration:none;padding:6px 10px;border:1px solid rgba(120,140,200,0.25);border-radius:4px}
.legal-nav a:hover{background:rgba(60,80,150,0.15);color:#fff}
`;
