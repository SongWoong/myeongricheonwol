import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { calcJami, formatJamiForPrompt } from "@/app/lib/jami";
import { stripMarkdown, NO_MARKDOWN_RULE } from "@/app/lib/sanitize";
import { VOICES, voiceBlock } from "@/app/lib/voices";
import { getJamiChapter } from "@/app/lib/jami-chapters";
import { gateFeature } from "@/app/lib/payment/gate";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { name, birthdate, hour, minute, gender, calendar, chapterId = "general", longitude } = await req.json();

    if (!name || !birthdate || hour === undefined || hour === null) {
      return NextResponse.json({ error: "이름·생년월일·시간 모두 필요합니다" }, { status: 400 });
    }

    const chapter = getJamiChapter(chapterId);
    if (!chapter) {
      return NextResponse.json({ error: "존재하지 않는 챕터입니다" }, { status: 400 });
    }

    let gate: Awaited<ReturnType<typeof gateFeature>> | null = null;
    if (chapter.price > 0) {
      gate = await gateFeature(`jami.${chapter.id}`);
      if (!gate.ok) return gate.response;
    }

    const chart = calcJami({
      birthdate,
      hour: Number(hour),
      minute: Number(minute) || 0,
      gender,
      calendar,
      longitude,
    });
    const block = formatJamiForPrompt(chart);

    const now = new Date();
    const todayStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;

    const heavy = chapter.id === "general" || chapter.id === "thisyear" || chapter.id === "daewoon";
    const isLight = chapter.id === "thisyear-light";
    const isPaid = chapter.price > 0;
    const model = isPaid ? "claude-sonnet-4-6" : "claude-haiku-4-5-20251001";
    const maxTokens = isPaid
      ? (heavy ? 12000 : 6000)
      : (isLight ? 1200 : 3000);

    const message = await client.messages.create({
      model,
      max_tokens: maxTokens,
      messages: [
        {
          role: "user",
          content: `당신은 정통 자미두수(紫微斗數)에 통달한 풀이사 '성연(星淵)'입니다.
아래 명반은 정밀 계산된 12궁 별자 배치입니다. 이 명반을 바탕으로 [${chapter.promptTitle}]에 대해 풀이해주세요.

이름: ${name}
성별: ${gender}
오늘 날짜: ${todayStr}

${block}

${chapter.promptInstruction}

각 항목 제목 앞에 ✦ 기호를 유지하고, 항목 사이는 빈 줄로 구분해주세요.

[한자 표기 규칙 — 매우 중요]
- 한자가 등장할 때마다 즉시 한글 발음을 괄호로 표기. 한자 못 읽는 사람도 읽을 수 있어야 함.
- 12궁 한자(命宮·夫妻宮·財帛宮 등)와 별 이름 한자(紫微·貪狼·破軍 등)는 반드시 한글 병기:
  예) "命宮(명궁)의 紫微(자미)·貪狼(탐랑)"
- 별자 인용 시 (한글, 쉬운 풀이) 형식으로 발음 + 의미를 같이 적기:
  예) "命宮(명궁)의 紫微·貪狼(자미·탐랑, 중심을 잡는 별과 욕망의 별이 함께 있어 카리스마가 큼)"
- 4화(化祿·化權·化科·化忌)도 한글 병기 필수.

${voiceBlock(VOICES.seongyeon)}

${NO_MARKDOWN_RULE}`,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";

    if (gate?.ok) {
      try { await gate.consume(); } catch (e) { console.error("[jami] consume credit failed", e); }
    }

    const summary = `명궁(${chart.soulPalaceBranch}) · 신궁(${chart.bodyPalaceBranch}) · ${chart.fiveElementsClass} · ${chart.zodiac}띠`;
    return NextResponse.json({ result: stripMarkdown(raw), chart: summary, chapterId });
  } catch (err) {
    console.error("[/api/jami]", err);
    const msg = err instanceof Error ? err.message : "서버 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
