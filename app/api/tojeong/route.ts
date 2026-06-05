import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { calcSaju, formatSajuForPrompt } from "@/app/lib/saju";
import { Solar } from "lunar-typescript";
import { stripMarkdown, NO_MARKDOWN_RULE } from "@/app/lib/sanitize";
import { VOICES, voiceBlock } from "@/app/lib/voices";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { name, birthdate, gender, calendar, targetYear } = await req.json();

    if (!name || !birthdate) {
      return NextResponse.json({ error: "이름과 생년월일은 필수입니다" }, { status: 400 });
    }

    const chart = calcSaju({ birthdate, calendar, gender });
    const sajuBlock = formatSajuForPrompt(chart);

    const yearStart = Solar.fromYmd(targetYear, 2, 4).getLunar();
    const yearGanZhi = yearStart.getYearInGanZhi();

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 3500,
      messages: [
        {
          role: "user",
          content: `당신은 토정 이지함(土亭 李之菡) 선생의 비결을 잇는 신비로운 풀이사입니다.
사용자의 사주 명식과 ${targetYear}년의 세운(歲運)을 비교하여 한 해의 비결을 풀어주세요.

이름: ${name}
성별: ${gender}

${sajuBlock}

[${targetYear}년 세운]
- 년주(年柱): ${yearGanZhi}

다음 구조로 작성해주세요:

✦ 올해의 괘(卦)
(한 줄 시구만)

✦ 총운
(3문장 이내)

✦ 월별 운세
1월 — (핵심 한 줄만)
2월 — ...
... (반드시 1~12월 모두, 각 월 한 줄씩만)

✦ 재물·애정·건강 (각 1~2문장씩, 한 섹션으로 묶어도 됨)
✦ 길월·흉월 (각 달 이름만)
✦ 올해의 키워드 (색상·방위·숫자·단어 3개, 한 줄)

각 항목 제목 앞에 ✦ 기호를 유지하고, 항목 사이는 빈 줄로 구분해주세요.
월별 운세는 "1월 — " 형식 유지.

${voiceBlock(VOICES.general)}

${NO_MARKDOWN_RULE}`,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const truncated = message.stop_reason === "max_tokens";
    if (truncated) console.warn(`[tojeong] stop_reason=max_tokens usage=${JSON.stringify(message.usage)}`);
    return NextResponse.json({ result: stripMarkdown(raw), truncated });
  } catch (err) {
    console.error("[/api/tojeong]", err);
    const msg = err instanceof Error ? err.message : "서버 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
