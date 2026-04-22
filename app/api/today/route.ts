import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { calcSaju, formatSajuForPrompt } from "@/app/lib/saju";
import { Solar } from "lunar-typescript";
import { stripMarkdown, NO_MARKDOWN_RULE } from "@/app/lib/sanitize";
import { VOICES, voiceBlock } from "@/app/lib/voices";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { name, birthdate, gender, calendar, today } = await req.json();

    if (!name || !birthdate) {
      return NextResponse.json({ error: "이름과 생년월일은 필수입니다" }, { status: 400 });
    }

    const chart = calcSaju({ birthdate, calendar, gender });
    const sajuBlock = formatSajuForPrompt(chart);

    const [ty, tm, td] = today.split("-").map(Number);
    const todaySolar = Solar.fromYmd(ty, tm, td);
    const todayLunar = todaySolar.getLunar();
    const dayPillar = todayLunar.getDayInGanZhi();
    const monthPillar = todayLunar.getMonthInGanZhi();
    const yearPillar = todayLunar.getYearInGanZhi();

    const todayBlock = `[오늘의 천기 (${today})]
- 년: ${yearPillar}, 월: ${monthPillar}, 일: ${dayPillar}
- 음력: ${todayLunar.getYear()}년 ${todayLunar.getMonth()}월 ${todayLunar.getDay()}일
- 절기: ${todayLunar.getPrevJieQi().toString()}`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1200,
      messages: [
        {
          role: "user",
          content: `당신은 달빛 아래에서 하루의 기운을 읽어주는 신비로운 풀이사입니다.
사용자의 사주 명식과 오늘의 천기(天氣)를 비교하여 오늘 하루의 운세를 풀어주세요.

이름: ${name}
성별: ${gender}

${sajuBlock}

${todayBlock}

오늘의 일간(${dayPillar[0]})과 사용자 일간(${chart.dayMaster.gan})의 관계, 오늘의 지지가 사용자 명식과 어떤 충/합/형/해를 이루는지를 고려해서 풀이해주세요.

다음 항목으로 나눠서 작성 (각 항목 2~3문장, 너무 길지 않게):

✦ 오늘의 총평
✦ 애정·인간관계
✦ 재물·업무
✦ 조심할 일
✦ 행운의 키워드 (단어 3개, 색상 1개, 방위 1개)

각 항목 제목 앞에 ✦ 기호를 유지하고, 항목 사이는 빈 줄로 구분해주세요.

${voiceBlock(VOICES.general)}

${NO_MARKDOWN_RULE}`,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ result: stripMarkdown(raw) });
  } catch (err) {
    console.error("[/api/today]", err);
    const msg = err instanceof Error ? err.message : "서버 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
