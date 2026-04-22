import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { calcSaju, formatSajuForPrompt } from "@/app/lib/saju";
import { stripMarkdown, NO_MARKDOWN_RULE } from "@/app/lib/sanitize";
import { VOICES, voiceBlock } from "@/app/lib/voices";
import { getDuoTopic } from "@/app/lib/duo-topics";
import { shuffleAndDraw } from "@/app/lib/tarot";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { name, birthdate, time, gender, calendar, topicId, question } = await req.json();

    if (!name || !birthdate || !topicId) {
      return NextResponse.json({ error: "이름·생년월일·주제가 필요합니다" }, { status: 400 });
    }

    const topic = getDuoTopic(topicId);
    if (!topic) {
      return NextResponse.json({ error: "존재하지 않는 주제입니다" }, { status: 400 });
    }

    // 사주 명식 계산
    const chart = calcSaju({ birthdate, time, calendar, gender });
    const sajuBlock = formatSajuForPrompt(chart);

    // 타로 3장 뽑기
    const drawn = shuffleAndDraw(3);
    const positions = ["과거", "현재", "미래"];
    const cardsBlock = drawn.map((d, i) => {
      return `[${positions[i]}] ${d.card.nameKo} (${d.card.nameEn})${d.reversed ? " — 역방향" : " — 정방향"}
  · 정방향 의미: ${d.card.upright}
  · 역방향 의미: ${d.card.reversed}`;
    }).join("\n\n");

    const userQ = (question || "").trim() || `${topic.title} — ${topic.desc}`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4500,
      messages: [
        {
          role: "user",
          content: `당신은 두 풀이사 '자운(紫雲·사주)'과 '월령(月靈·타로)'의 공동 풀이입니다.
사주의 깊이와 타로의 직관을 함께 엮어 그대에게 답해주세요.

[주제] ${topic.icon} ${topic.title} — ${topic.desc}
[사용자 질문] ${userQ}

${sajuBlock}

[월령이 뽑은 카드 3장 — 과거·현재·미래]
${cardsBlock}

다음 구조로 정확히 작성하세요:

✦ 한 줄 답
(사용자의 질문에 대한 핵심 결론 한 문장. 단정짓지 말되 방향은 분명하게)

✦ 자운의 풀이 — 사주가 말하는 그대
(사주 명식이 이 주제에 대해 보여주는 것. ${topic.sajuFocus})
(명식의 구체적 글자를 1~2회 인용하되 괄호로 쉬운 설명 필수)

✦ 월령의 풀이 — 카드가 비추는 지금
(${topic.tarotFocus})
(카드 3장의 흐름을 이야기로 엮어서)

✦ 두 풀이가 함께 알려주는 것
(사주(타고난 결)와 타로(지금 흐름)가 서로 어떻게 보완하거나 강조하는지)
(4~5문장으로 깊이 있게)

✦ 실천 조언
(구체적으로 어떻게 행동할지. 시기·상황·행동을 명시. 추상적 조언 금지)

✦ 이 만남의 키워드 3개

각 항목 제목 앞에 ✦ 기호 유지, 항목 사이 빈 줄.

[두 풀이사가 함께 말하는 규칙]
- 자운 섹션은 '그대'라는 호칭으로 차분하게
- 월령 섹션은 '당신'이라는 호칭으로 따뜻하게
- 나머지는 자연스럽게

${voiceBlock(VOICES.jawun)}

${NO_MARKDOWN_RULE}`,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({
      result: stripMarkdown(raw),
      cards: drawn.map((d, i) => ({
        position: positions[i],
        nameKo: d.card.nameKo,
        nameEn: d.card.nameEn,
        image: d.card.image,
        reversed: d.reversed,
      })),
      topic: { id: topic.id, title: topic.title, icon: topic.icon },
    });
  } catch (err) {
    console.error("[/api/duo]", err);
    const msg = err instanceof Error ? err.message : "서버 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
