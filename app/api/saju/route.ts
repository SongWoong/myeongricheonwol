import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { calcSaju, formatSajuForPrompt } from "@/app/lib/saju";
import { stripMarkdown, NO_MARKDOWN_RULE } from "@/app/lib/sanitize";
import { getChapter } from "@/app/lib/saju-chapters";
import { VOICES, voiceBlock } from "@/app/lib/voices";
import { gateFeature } from "@/app/lib/payment/gate";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { name, birthdate, time, gender, calendar, chapterId = "general", longitude } = await req.json();

    if (!name || !birthdate) {
      return NextResponse.json({ error: "이름과 생년월일은 필수입니다" }, { status: 400 });
    }

    const chapter = getChapter(chapterId);
    if (!chapter) {
      return NextResponse.json({ error: "존재하지 않는 챕터입니다" }, { status: 400 });
    }

    // 유료 챕터는 권한 게이트 — 챕터별 feature 키 (saju.{id})
    let gate: Awaited<ReturnType<typeof gateFeature>> | null = null;
    if (chapter.price > 0) {
      gate = await gateFeature(`saju.${chapter.id}`);
      if (!gate.ok) return gate.response;
    }

    const chart = calcSaju({ birthdate, time, calendar, gender, longitude });
    const sajuBlock = formatSajuForPrompt(chart);

    const now = new Date();
    const todayStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;

    const heavy = chapter.id === "general" || chapter.id === "thisyear" || chapter.id === "daewoon";
    const isLight = chapter.id === "thisyear-light";
    const isPaid = chapter.price > 0;
    const model = isPaid ? "claude-sonnet-4-6" : "claude-haiku-4-5-20251001";
    const maxTokens = isPaid
      ? (heavy ? 16000 : 8000)
      : (isLight ? 1200 : 3000);

    const message = await client.messages.create({
      model,
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
- 천간(天干, 천간) / 지지(地支, 지지) 한자는 반드시 한글 발음 병기:
  예) "庚午(경오) 년주", "丙火(병화) 일간", "甲木(갑목)이 강함"
- 십신·격국 한자도 한글 병기: "正印(정인)", "偏財(편재)", "比劫(비겁)", "傷官(상관)"
- 한자 단어 뒤에는 (한글, 쉬운 풀이) 형식으로 발음 + 의미를 같이 적기:
  예) "庚午(경오) 년주의 正印(정인, 어른·스승의 도움이 있는 자리)"

${voiceBlock(VOICES.jawun)}

${NO_MARKDOWN_RULE}`,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const truncated = message.stop_reason === "max_tokens";
    if (truncated) console.warn(`[saju] stop_reason=max_tokens chapterId=${chapterId} usage=${JSON.stringify(message.usage)}`);

    if (gate?.ok) {
      try { await gate.consume(); } catch (e) { console.error("[saju] consume credit failed", e); }
    }

    return NextResponse.json({ result: stripMarkdown(raw), chart: chart.formatted, chapterId, truncated });
  } catch (err) {
    console.error("[/api/saju]", err);
    const msg = err instanceof Error ? err.message : "서버 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
