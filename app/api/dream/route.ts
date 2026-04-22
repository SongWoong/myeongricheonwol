import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { stripMarkdown, NO_MARKDOWN_RULE } from "@/app/lib/sanitize";
import { VOICES, voiceBlock } from "@/app/lib/voices";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { dream } = await req.json();

    if (!dream || typeof dream !== "string" || dream.trim().length < 5) {
      return NextResponse.json({ error: "꿈 내용이 너무 짧습니다" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `당신은 동양의 전통 해몽서와 융 심리학에 두루 통달한 신비로운 해몽가입니다.
아래 꿈 내용을 바탕으로 그 꿈에 담긴 상징과 의미를 풀이해주세요.

[꿈 내용]
${dream.trim().slice(0, 1000)}

다음 항목으로 나눠서 풀이해주세요:

✦ 꿈의 상징
(꿈에 등장한 핵심 사물·인물·풍경의 상징적 의미)

✦ 길몽인가 흉몽인가
(길몽/흉몽/중립 중 하나로 판정하고 그 이유를 짧게)

✦ 의미와 메시지
(꿈이 그대에게 전하려는 메시지)

✦ 가까운 미래의 암시
(꿈이 가리키는 가까운 일·관계·기회·주의점)

✦ 오늘의 조언
(꿈을 꾼 사람이 오늘 무엇을 하면 좋을지)

각 항목 제목 앞에 ✦ 기호를 유지하고, 항목 사이는 빈 줄로 구분해주세요.

${voiceBlock(VOICES.general)}

${NO_MARKDOWN_RULE}`,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ result: stripMarkdown(raw) });
  } catch (err) {
    console.error("[/api/dream]", err);
    const msg = err instanceof Error ? err.message : "서버 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
