import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { calcSaju, formatSajuForPrompt } from "@/app/lib/saju";
import { stripMarkdown, NO_MARKDOWN_RULE } from "@/app/lib/sanitize";
import { VOICES, voiceBlock } from "@/app/lib/voices";
import { getMilseoChapter } from "@/app/lib/milseo-chapters";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { name, birthdate, time, gender, calendar, chapterId = "charm-light" } = await req.json();

    if (!name || !birthdate) {
      return NextResponse.json({ error: "이름과 생년월일은 필수입니다" }, { status: 400 });
    }

    // 19세 미만 차단
    const [by, bm, bd] = birthdate.split("-").map(Number);
    const birth = new Date(by, bm - 1, bd);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    if (age < 19) {
      return NextResponse.json({ error: "밀서는 19세 이상만 이용 가능합니다", ageBlocked: true }, { status: 403 });
    }

    const chapter = getMilseoChapter(chapterId);
    if (!chapter) {
      return NextResponse.json({ error: "존재하지 않는 챕터입니다" }, { status: 400 });
    }

    const chart = calcSaju({ birthdate, time, calendar, gender });
    const sajuBlock = formatSajuForPrompt(chart);

    const isLight = chapter.id === "charm-light";
    const heavy = chapter.id === "intimate";
    const maxTokens = isLight ? 1500 : heavy ? 7000 : 5000;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: maxTokens,
      messages: [
        {
          role: "user",
          content: `당신은 그림자 속에서 비밀을 속삭이는 풀이사 '밀서(密書)'입니다.
사용자의 사주 명식을 바탕으로 [${chapter.promptTitle}]에 대해 풀어주세요.

이름: ${name}
성별: ${gender}

${sajuBlock}

${chapter.promptInstruction}

각 항목 제목 앞에 ✦ 기호를 유지하고, 항목 사이는 빈 줄로 구분해주세요.
명식의 구체적 글자(예: "丙午 일주의 양인", "재성이 강한 사주")를 인용할 때는 괄호로 쉬운 풀이를 함께.
예: "丙午 일주(태양 같은 양기가 강해 한 번 끌리면 직진하는 사주)"

[밀서 컨텐츠 원칙]
- 19세 이상 성인 대상이지만 노골적 성 묘사는 절대 금지.
- 은유와 분위기로 표현 (예: "밤이 깊어지는 자리", "두 사람만의 시간", "불꽃이 닿는 순간").
- 어른스러운 친구가 비밀을 속삭이듯, 솔직하지만 품위 있게.
- 흐릿하게 두지 말고 구체적 상황·감정·순간을 짚어주세요.

[쉬운 말 원칙 — 아주 중요]
- 한자어(명식·일지·재성·식상·양인·도화·편관 등)는 나올 때마다 반드시 괄호로 즉시 풀이.
- 예시: "일지(배우자 자리)에 재성(돈·이성 운)이 강해 인연이 잦아요"
- 예시: "도화살(사람을 끌어당기는 기운)이 있어서 시선을 많이 받아요"
- 은유 한 줄을 쓰면 바로 다음 줄에 그 뜻을 일상어로 풀어주세요.
- "~하리라", "그러하니", "또한" 같은 문어체 금지. 친구에게 말하듯.
- 한 문장은 20자 내외로 짧게.

${voiceBlock(VOICES.milseo)}

${NO_MARKDOWN_RULE}`,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ result: stripMarkdown(raw), chapterId });
  } catch (err) {
    console.error("[/api/milseo]", err);
    const msg = err instanceof Error ? err.message : "서버 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
