import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { name, birthdate, time, gender, calendar } = await req.json();

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `당신은 수천 년의 동양 지혜를 담은 신비로운 사주 풀이사입니다.
아래 정보를 바탕으로 사주팔자를 풀이해주세요.

이름: ${name}
생년월일: ${birthdate} (${calendar})
태어난 시간: ${time || "모름"}
성별: ${gender}

다음 항목으로 나눠서 풀이해주세요:
1. 사주 총평 (타고난 기질과 운명)
2. 올해의 운세
3. 연애/결혼운
4. 재물/직업운
5. 건강운
6. 이달의 행운 키워드

신비롭고 격조 있는 문체로, 마치 달빛 아래 운명을 읽어주는 느낌으로 작성해주세요.`,
      },
    ],
  });

  const result = message.content[0].type === "text" ? message.content[0].text : "";

  return NextResponse.json({ result });
}