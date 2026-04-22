import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { calcJami, formatJamiForPrompt } from "@/app/lib/jami";
import { stripMarkdown, NO_MARKDOWN_RULE } from "@/app/lib/sanitize";
import { VOICES, voiceBlock } from "@/app/lib/voices";
import { getJamiChapter } from "@/app/lib/jami-chapters";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { name, birthdate, hour, minute, gender, calendar, chapterId = "general" } = await req.json();

    if (!name || !birthdate || hour === undefined || hour === null) {
      return NextResponse.json({ error: "이름·생년월일·시간 모두 필요합니다" }, { status: 400 });
    }

    const chapter = getJamiChapter(chapterId);
    if (!chapter) {
      return NextResponse.json({ error: "존재하지 않는 챕터입니다" }, { status: 400 });
    }

    const chart = calcJami({
      birthdate,
      hour: Number(hour),
      minute: Number(minute) || 0,
      gender,
      calendar,
    });
    const block = formatJamiForPrompt(chart);

    const heavy = chapter.id === "general" || chapter.id === "thisyear" || chapter.id === "daewoon";
    const isLight = chapter.id === "thisyear-light";
    const maxTokens = isLight ? 1200 : heavy ? 5500 : 3000;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: maxTokens,
      messages: [
        {
          role: "user",
          content: `당신은 정통 자미두수(紫微斗數)에 통달한 풀이사 '성연(星淵)'입니다.
아래 명반은 정밀 계산된 12궁 별자 배치입니다. 이 명반을 바탕으로 [${chapter.promptTitle}]에 대해 풀이해주세요.

이름: ${name}
성별: ${gender}

${block}

${chapter.promptInstruction}

각 항목 제목 앞에 ✦ 기호를 유지하고, 항목 사이는 빈 줄로 구분해주세요.
별자 이름을 인용할 때(예: "명궁의 자미·탐랑")는 반드시 괄호로 쉬운 풀이를 적어주세요.
예: "명궁의 자미·탐랑(중심을 잡는 별과 욕망의 별이 함께 있어 카리스마가 큼)"

${voiceBlock(VOICES.seongyeon)}

${NO_MARKDOWN_RULE}`,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const summary = `명궁(${chart.soulPalaceBranch}) · 신궁(${chart.bodyPalaceBranch}) · ${chart.fiveElementsClass} · ${chart.zodiac}띠`;
    return NextResponse.json({ result: stripMarkdown(raw), chart: summary, chapterId });
  } catch (err) {
    console.error("[/api/jami]", err);
    const msg = err instanceof Error ? err.message : "서버 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
