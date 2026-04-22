import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { calcSaju, formatSajuForPrompt } from "@/app/lib/saju";
import { stripMarkdown, NO_MARKDOWN_RULE } from "@/app/lib/sanitize";
import { getChapter } from "@/app/lib/saju-chapters";
import { VOICES, voiceBlock } from "@/app/lib/voices";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { name, birthdate, time, gender, calendar, chapterId = "general" } = await req.json();

    if (!name || !birthdate) {
      return NextResponse.json({ error: "이름과 생년월일은 필수입니다" }, { status: 400 });
    }

    const chapter = getChapter(chapterId);
    if (!chapter) {
      return NextResponse.json({ error: "존재하지 않는 챕터입니다" }, { status: 400 });
    }

    const chart = calcSaju({ birthdate, time, calendar, gender });
    const sajuBlock = formatSajuForPrompt(chart);

    const heavy = chapter.id === "general" || chapter.id === "thisyear" || chapter.id === "daewoon";
    const isLight = chapter.id === "thisyear-light";
    const maxTokens = isLight ? 1200 : heavy ? 5500 : 3000;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: maxTokens,
      messages: [
        {
          role: "user",
          content: `당신은 정통 자평명리(子平命理)에 정통한 사주 풀이사 '자운(紫雲)'입니다.
아래 명식은 만세력으로 정밀 계산된 사주 8자입니다. 이 명식을 바탕으로 [${chapter.promptTitle}]에 대해 풀이해주세요.

이름: ${name}
성별: ${gender}

${sajuBlock}

${chapter.promptInstruction}

각 항목 제목 앞에 ✦ 기호를 유지하고, 항목 사이는 빈 줄로 구분해주세요.
명식의 구체적 글자를 인용할 때(예: "庚午 년주의 정인")는 반드시 괄호로 쉬운 풀이를 함께 적어주세요.
예: "庚午 년주의 정인(어른·스승의 도움이 있는 자리)"

${voiceBlock(VOICES.jawun)}

${NO_MARKDOWN_RULE}`,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ result: stripMarkdown(raw), chart: chart.formatted, chapterId });
  } catch (err) {
    console.error("[/api/saju]", err);
    const msg = err instanceof Error ? err.message : "서버 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
