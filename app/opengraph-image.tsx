import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "명리천월 命理天月 — 사주·타로·자미두수 종합 풀이";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadFont(family: string) {
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@400;700&display=swap`;
  const css = await (await fetch(url)).text();
  const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!match) return null;
  const fontUrl = match[1];
  return await (await fetch(fontUrl)).arrayBuffer();
}

export default async function Image() {
  const [diphylleia, notoSerifKR] = await Promise.all([
    loadFont("Diphylleia"),
    loadFont("Noto Serif KR"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse 70% 60% at 50% 30%, rgba(112,96,224,0.45), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(160,64,192,0.35), transparent 60%), radial-gradient(ellipse 50% 50% at 20% 80%, rgba(64,128,200,0.25), transparent 60%), #0a0618",
          color: "#fff",
          position: "relative",
          fontFamily: "'Noto Serif KR'",
        }}
      >
        {/* 별빛 점들 */}
        {[
          { t: "8%", l: "12%", s: 4 }, { t: "14%", l: "82%", s: 3 },
          { t: "22%", l: "30%", s: 3 }, { t: "30%", l: "70%", s: 4 },
          { t: "48%", l: "8%", s: 3 }, { t: "55%", l: "92%", s: 4 },
          { t: "75%", l: "18%", s: 3 }, { t: "82%", l: "62%", s: 3 },
          { t: "88%", l: "88%", s: 4 },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: s.t, left: s.l,
              width: s.s, height: s.s,
              borderRadius: "50%",
              background: "#fff",
              boxShadow: `0 0 ${s.s * 4}px #b0c8ff`,
            }}
          />
        ))}

        {/* 메인 로고 */}
        <div
          style={{
            fontFamily: "'Diphylleia', 'Noto Serif KR', serif",
            fontSize: 144,
            color: "#fff",
            letterSpacing: 12,
            textShadow: "0 0 40px rgba(180,160,255,0.7), 0 4px 20px rgba(0,0,0,0.5)",
            marginBottom: 8,
            lineHeight: 1,
            display: "flex",
          }}
        >
          命理天月
        </div>

        {/* 한글 보조 */}
        <div
          style={{
            fontFamily: "'Diphylleia', 'Noto Serif KR', serif",
            fontSize: 56,
            color: "#e0d0ff",
            letterSpacing: 14,
            marginBottom: 36,
            textShadow: "0 0 20px rgba(180,160,255,0.5)",
            display: "flex",
          }}
        >
          명 리 천 월
        </div>

        {/* 구분선 */}
        <div
          style={{
            width: 240,
            height: 1,
            background: "linear-gradient(to right, transparent, rgba(220,200,255,0.6), transparent)",
            marginBottom: 28,
            display: "flex",
          }}
        />

        {/* 서브타이틀 */}
        <div
          style={{
            fontSize: 36,
            color: "#fff",
            letterSpacing: 6,
            marginBottom: 14,
            display: "flex",
            fontWeight: 500,
          }}
        >
          사주 · 타로 · 자미두수
        </div>

        <div
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.7)",
            letterSpacing: 4,
            display: "flex",
          }}
        >
          네 풀이사가 함께하는 운명 상담
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(diphylleia ? [{ name: "Diphylleia", data: diphylleia, weight: 400 as const, style: "normal" as const }] : []),
        ...(notoSerifKR ? [{ name: "Noto Serif KR", data: notoSerifKR, weight: 400 as const, style: "normal" as const }] : []),
      ],
    },
  );
}
