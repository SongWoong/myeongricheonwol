export interface DuoTopic {
  id: string;
  icon: string;
  title: string;
  desc: string;
  questionHint: string;
  sajuFocus: string;
  tarotFocus: string;
}

export const DUO_TOPICS: DuoTopic[] = [
  {
    id: "love",
    icon: "💕",
    title: "연애",
    desc: "좋아하는 사람, 설렘, 이 관계가 잘 풀릴까",
    questionHint: "예: 요즘 마음에 두는 사람이 있는데, 잘될 수 있을까요?",
    sajuFocus: "일지(배우자 자리)와 재성·관성으로 본 그대의 연애 기질, 이번 시기 인연 흐름",
    tarotFocus: "지금의 감정 흐름과 가까운 미래의 가능성",
  },
  {
    id: "reunion",
    icon: "💔",
    title: "재회",
    desc: "헤어진 사람, 다시 인연이 닿을까",
    questionHint: "예: 헤어진 그 사람과 다시 만날 수 있을까요?",
    sajuFocus: "사랑·이별을 흔드는 충(沖)·합(合)의 시기, 인연의 매듭",
    tarotFocus: "과거에 있었던 일 · 지금의 두 사람 · 다가올 흐름 (3장 과거-현재-미래)",
  },
  {
    id: "match",
    icon: "💍",
    title: "궁합·결혼",
    desc: "이 사람과 인연일까, 결혼해도 될까",
    questionHint: "예: 지금 만나는 사람과 결혼해도 좋을까요?",
    sajuFocus: "그대의 일주가 어떤 사람과 잘 맞는지, 결혼운이 강해지는 시기",
    tarotFocus: "지금 두 사람 사이의 흐름과 미래의 가능성",
  },
  {
    id: "money",
    icon: "💰",
    title: "돈·재물",
    desc: "재정 상황, 투자, 사업의 흐름",
    questionHint: "예: 올해 재물운이 어떨까요? 투자해도 될까요?",
    sajuFocus: "재성(돈을 끄는 별)의 강약, 돈을 버는 방식, 재물의 시기",
    tarotFocus: "지금의 재정 흐름과 가까운 미래의 변화",
  },
  {
    id: "career",
    icon: "💼",
    title: "일·진로",
    desc: "이직, 승진, 새 도전의 시기",
    questionHint: "예: 올해 이직해도 될까요? 새로 시작하려는 일이 잘 될까요?",
    sajuFocus: "관성(일의 별)과 식상(재능의 별), 진로 흐름",
    tarotFocus: "지금의 상황과 결정의 결과",
  },
];

export function getDuoTopic(id: string): DuoTopic | undefined {
  return DUO_TOPICS.find((t) => t.id === id);
}
