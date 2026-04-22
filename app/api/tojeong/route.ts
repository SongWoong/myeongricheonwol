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
      max_tokens: 7500,
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
(이 사람의 ${targetYear}년 운세를 한 줄 시구로 표현, 예: "구름이 걷히고 달이 드러난다 — 雲散月現")

✦ 총운
(${targetYear}년 세운(${yearGanZhi})과 사용자 일간(${chart.dayMaster.gan})의 관계를 고려한 한 해 흐름, 4~5문장)

✦ 월별 운세
1월 — (핵심 한 줄 + 풀이 2문장, 너무 길게 쓰지 말 것)
2월 — ...
... (반드시 1월~12월 12개 모두, 각 월 3줄 이내)

✦ 재물운 (2~3문장)
✦ 애정·인연운 (2~3문장)
✦ 건강운 (2~3문장)
✦ 길월·흉월 (가장 좋은 달과 조심할 달)
✦ 올해의 부적 (색상 1, 방위 1, 숫자 1, 키워드 단어 3개)
   — 각 항목은 짧게 한 줄씩만, 길게 설명하지 말 것

각 항목 제목 앞에 ✦ 기호를 유지하고, 항목 사이는 빈 줄로 구분해주세요.
월별 운세는 "1월 — " 형식 유지.

${voiceBlock(VOICES.general)}

${NO_MARKDOWN_RULE}`,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ result: stripMarkdown(raw) });
  } catch (err) {
    console.error("[/api/tojeong]", err);
    const msg = err instanceof Error ? err.message : "서버 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
