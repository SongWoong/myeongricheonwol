import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { stripMarkdown, NO_MARKDOWN_RULE } from "@/app/lib/sanitize";
import { VOICES, voiceBlock } from "@/app/lib/voices";

const client = new Anthropic();

interface DrawnCardPayload {
  position: string;
  nameKo: string;
  nameEn: string;
  reversed: boolean;
  upright: string;
  reversedMeaning: string;
  keywords: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { question, spread, cards }: { question: string; spread: { id: string; name: string; positions: string[] }; cards: DrawnCardPayload[] } = await req.json();

    if (!question || !cards || cards.length === 0) {
      return NextResponse.json({ error: "질문과 카드가 필요합니다" }, { status: 400 });
    }

    const cardsBlock = cards.map((c, i) => {
      return `[${i + 1}. ${c.position}] ${c.nameKo} (${c.nameEn})${c.reversed ? " — 역방향" : " — 정방향"}
  · 정방향 의미: ${c.upright}
  · 역방향 의미: ${c.reversedMeaning}
  · 키워드: ${c.keywords.join(", ")}`;
    }).join("\n\n");

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: cards.length === 1
        ? 700
        : Math.min(1200 + cards.length * 450, 5500),
      messages: [
        {
          role: "user",
          content: cards.length === 1
            ? `당신은 달빛 아래에서 운명의 카드를 읽어주는 타로 풀이사 '월령(月靈)'입니다.
사용자의 질문에 한 장의 카드로 짧고 따뜻하게 답해주세요.

[질문]
${question}

[뽑힌 카드]
${cardsBlock}

다음 형식으로 짧게 (총 4~5문장 정도):

✦ 카드 — ${cards[0].nameKo}${cards[0].reversed ? " (역)" : ""}
(이 카드가 무엇을 말하는지 1~2문장)

✦ 질문에 대한 답
(사용자의 질문 "${question}"에 대한 명확한 한 줄 답 + 짧은 행동 조언 1개)

✦ 키워드
(단어 3개)

[원칙]
- 짧게, 핵심만. 길게 쓰지 마세요.
- 카드 일반론 금지. 반드시 사용자 질문과 연결.
- "긍정적으로" 같은 막연한 표현 대신 구체적으로.
- 더 자세한 풀이는 3장/10장 스프레드에서 가능하다는 걸 마지막에 한 줄 안내.

${voiceBlock(VOICES.wolryeong)}

${NO_MARKDOWN_RULE}`
            : `당신은 달빛 아래에서 운명의 카드를 읽어주는 신비로운 타로 풀이사 '월령(月靈)'입니다.
사용자의 질문에 대해 뽑힌 카드를 바탕으로 깊이 있게 풀이해주세요.

[질문]
${question}

[스프레드: ${spread.name}]

[뽑힌 카드]
${cardsBlock}

다음 구조로 풀이해주세요:

✦ 카드의 부름
(전체 카드 흐름이 무엇을 말하고 있는지 한 단락으로 요약. 사용자의 질문 "${question}"에 대한 첫 인상을 한 문장으로 답하면서 시작.)

${cards.map((c) => `✦ ${c.position} — ${c.nameKo}${c.reversed ? " (역)" : ""}
- 카드의 상징을 한 줄로
- 이 카드가 사용자의 질문 "${question}"의 [${c.position}]에 나타난 구체적 의미 (반드시 질문에 맞춰서)
- 정/역방향이 어떤 차이를 만드는지
- 이 위치에서 사용자가 알아두어야 할 구체적 한 가지`).join("\n\n")}

✦ 카드 사이의 흐름
(각 카드들이 서로 어떻게 영향을 주고받는지, 큰 그림에서 어떤 이야기인지)

✦ 월령의 조언
(전체를 종합. 다음 두 가지를 반드시 포함:
 1) 사용자의 질문에 대한 명확한 한 줄 답 (예: "지금 시작하셔도 괜찮아요" / "한 달만 더 살펴보세요")
 2) 구체적으로 무엇을 / 언제 / 어떻게 하면 좋은지 행동 지침 1~2개)

각 항목 제목 앞에 ✦ 기호를 유지하고, 항목 사이는 빈 줄로 구분해주세요.

[중요한 풀이 원칙]
- 모든 카드 풀이는 사용자의 질문 "${question}"과 직접 연결해서 답하세요. 카드의 일반적 의미만 나열 금지.
- 추상적 표현("열린 마음으로", "긍정적으로") 대신 구체적 상황·행동·시점을 제시하세요.
- 답을 회피하지 말고 카드가 말하는 방향을 솔직하게 전달하세요.

${voiceBlock(VOICES.wolryeong)}

${NO_MARKDOWN_RULE}`,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ result: stripMarkdown(raw) });
  } catch (err) {
    console.error("[/api/tarot]", err);
    const msg = err instanceof Error ? err.message : "서버 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
