import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { calcSaju, formatSajuForPrompt } from "@/app/lib/saju";
import { SAJU_CHAPTERS } from "@/app/lib/saju-chapters";
import { VOICES, voiceBlock } from "@/app/lib/voices";
import { stripMarkdown, NO_MARKDOWN_RULE } from "@/app/lib/sanitize";
import { renderSajuPDF, type PdfChapterResult } from "@/app/lib/saju-pdf";

// Next.js가 이 라우트를 Node.js 런타임으로 실행하도록 강제
export const runtime = "nodejs";

export const maxDuration = 300; // Vercel Pro: 최대 300초

const client = new Anthropic();

const CORE_IDS = ["general", "love", "daewoon", "thisyear"];
const FULL_IDS  = ["general", "love", "money", "career", "health", "family", "daewoon", "thisyear"];

const HEAVY = new Set(["general", "daewoon", "thisyear"]);

export async function POST(req: NextRequest) {
  try {
    const {
      name, birthdate, time, gender, calendar, longitude,
      pdfType = "core",
    } = await req.json();

    if (!name || !birthdate) {
      return NextResponse.json({ error: "이름과 생년월일은 필수입니다" }, { status: 400 });
    }
    if (pdfType !== "core" && pdfType !== "full") {
      return NextResponse.json({ error: "잘못된 pdfType" }, { status: 400 });
    }

    const chart = calcSaju({ birthdate, time, calendar, gender, longitude });
    const sajuBlock = formatSajuForPrompt(chart);

    const now = new Date();
    const todayStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;

    const ids = pdfType === "full" ? FULL_IDS : CORE_IDS;
    const chapterDefs = ids
      .map((id) => SAJU_CHAPTERS.find((c) => c.id === id))
      .filter(Boolean) as typeof SAJU_CHAPTERS;

    // 모든 챕터를 병렬로 AI 호출
    const results: PdfChapterResult[] = await Promise.all(
      chapterDefs.map(async (chapter) => {
        const maxTokens = HEAVY.has(chapter.id) ? 16000 : 8000;

        const message = await client.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: maxTokens,
          messages: [
            {
              role: "user",
              content: `당신은 정통 자평명리(子平命理)에 정통한 사주 풀이사 '자운(紫雲)'입니다.
아래 명식은 만세력으로 정밀 계산된 사주 8자입니다. 이 명식을 바탕으로 [${chapter.promptTitle}]에 대해 풀이해주세요.

이름: ${name}
성별: ${gender}
오늘 날짜: ${todayStr}

${sajuBlock}

${chapter.promptInstruction}

각 항목 제목 앞에 ✦ 기호를 유지하고, 항목 사이는 빈 줄로 구분해주세요.

[한자 표기 규칙 — 매우 중요]
- 한자가 등장할 때마다 즉시 한글 발음을 괄호로 표기. 한자 못 읽는 사람도 읽을 수 있어야 함.
- 천간·지지 한자는 반드시 한글 발음 병기: 예) "丙午(병오) 일주", "庚金(경금) 일간"
- 십신·신살 한자도 한글 병기: "羊刃(양인)", "桃花(도화)", "正官(정관)"
- 한자 단어 뒤에는 (한글, 쉬운 풀이) 형식으로 발음 + 의미를 같이 적기

${voiceBlock(VOICES.jawun)}

${NO_MARKDOWN_RULE}`,
            },
          ],
        });

        const raw = message.content[0].type === "text" ? message.content[0].text : "";
        if (message.stop_reason === "max_tokens") {
          console.warn(`[saju/pdf] stop_reason=max_tokens chapter=${chapter.id}`);
        }

        return {
          id: chapter.id,
          icon: chapter.icon,
          title: chapter.title,
          desc: chapter.desc,
          content: stripMarkdown(raw),
        };
      }),
    );

    const pdfBuffer = await renderSajuPDF({
      name, birthdate, gender, calendar: calendar ?? "양력",
      pdfType, chart, chapters: results, generatedAt: todayStr,
    });

    const filename = encodeURIComponent(`${name}_사주_${pdfType === "full" ? "전체" : "코어"}.pdf`);
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[/api/saju/pdf]", err);
    const msg = err instanceof Error ? err.message : "서버 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
