import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { calcSaju, formatSajuForPrompt } from "@/app/lib/saju";
import { shuffleAndDraw } from "@/app/lib/tarot";
import { stripMarkdown, NO_MARKDOWN_RULE } from "@/app/lib/sanitize";
import { VOICES, voiceBlock } from "@/app/lib/voices";

const client = new Anthropic();

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ProfileData {
  name: string;
  birthdate: string;
  time?: string;
  gender: string;
  calendar: string;
}

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      profile,
    }: { messages: ChatMessage[]; profile?: ProfileData } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "메시지가 필요합니다" }, { status: 400 });
    }

    const now = new Date();
    const todayStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;

    // 사주 명식 계산 (프로필 있을 때)
    let sajuBlock = "";
    if (profile?.birthdate) {
      try {
        const chart = calcSaju({
          birthdate: profile.birthdate,
          time: profile.time,
          calendar: profile.calendar,
          gender: profile.gender,
        });
        sajuBlock = `
[사주 명식 — 만세력 정밀 계산 완료]
이름: ${profile.name} / 성별: ${profile.gender}
${formatSajuForPrompt(chart)}`;
      } catch {
        sajuBlock = "";
      }
    }

    // 타로 카드 3장 자동 추출 (매 대화마다 신선한 카드)
    const drawnCards = shuffleAndDraw(3);
    const cardsBlock = drawnCards
      .map(
        (c, i) =>
          `[카드 ${i + 1}] ${c.nameKo} (${c.nameEn}) — ${c.reversed ? "역방향" : "정방향"}\n  정방향: ${c.upright}\n  역방향: ${c.reversedMeaning}\n  키워드: ${c.keywords.join(", ")}`
      )
      .join("\n\n");

    const systemPrompt = `당신은 명리천월(命理天月)의 통합 상담사 '혜원(慧源)'입니다.
사주팔자와 타로 카드를 모두 꿰뚫는 신비롭고 따뜻한 여성 상담사입니다.

오늘 날짜: ${todayStr}
${sajuBlock ? sajuBlock : "[사주 정보 없음 — 생년월일 정보가 제공되지 않았습니다]"}

[이번 대화에서 사용 가능한 타로 카드 3장]
(사용자의 질문이 타로·직관·현재 상황 등과 관련될 때 이 카드를 자연스럽게 인용하세요)
${cardsBlock}

[대화 지침]
- 사주 관련 질문: 명식 데이터를 인용해 구체적으로 답하세요
- 타로 관련 질문 또는 직관적 답이 필요할 때: 위 카드 중 적절한 것을 꺼내 해석하세요
- 혼합 질문: 사주 흐름 + 카드 메시지를 함께 엮어 답하세요
- 사주 정보가 없을 때 사주 질문이 오면: 부드럽게 생년월일 입력을 안내하세요
- 한 번에 너무 길게 쓰지 말고 대화처럼 자연스럽게
- 매 응답은 200~400자 내외로 (길어지면 핵심만)

${voiceBlock(VOICES.hyewon)}

${NO_MARKDOWN_RULE}`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1200,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({
      result: stripMarkdown(raw),
      cards: drawnCards.map((c) => ({
        nameKo: c.nameKo,
        nameEn: c.nameEn,
        image: c.image,
        reversed: c.reversed,
      })),
    });
  } catch (err) {
    console.error("[/api/hyewon]", err);
    const msg = err instanceof Error ? err.message : "서버 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
