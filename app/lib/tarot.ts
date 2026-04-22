export type Suit = "major" | "wands" | "cups" | "swords" | "pents";

export interface TarotCard {
  id: string;
  suit: Suit;
  num: number;
  nameKo: string;
  nameEn: string;
  image: string;
  upright: string;
  reversed: string;
  keywords: string[];
}

const major: TarotCard[] = [
  { id: "m00", suit: "major", num: 0,  nameKo: "바보", nameEn: "The Fool", image: "/tarot/major/00-fool.jpg",
    upright: "새로운 시작, 자유, 순수, 무한한 가능성", reversed: "무모함, 어리석은 선택, 망설임",
    keywords: ["시작","모험","순수","미지"] },
  { id: "m01", suit: "major", num: 1,  nameKo: "마법사", nameEn: "The Magician", image: "/tarot/major/01-magician.jpg",
    upright: "의지, 창조력, 능력 발휘, 집중", reversed: "기만, 미숙함, 잠재력 낭비",
    keywords: ["의지","창조","능력","실현"] },
  { id: "m02", suit: "major", num: 2,  nameKo: "여사제", nameEn: "The High Priestess", image: "/tarot/major/02-high_priestess.jpg",
    upright: "직관, 내면의 지혜, 신비, 비밀", reversed: "직관 무시, 비밀 폭로, 표면적 판단",
    keywords: ["직관","신비","지혜","고요"] },
  { id: "m03", suit: "major", num: 3,  nameKo: "여황제", nameEn: "The Empress", image: "/tarot/major/03-empress.jpg",
    upright: "풍요, 모성, 다산, 자연의 축복", reversed: "의존, 과보호, 창조성 막힘",
    keywords: ["풍요","모성","다산","사랑"] },
  { id: "m04", suit: "major", num: 4,  nameKo: "황제", nameEn: "The Emperor", image: "/tarot/major/04-emperor.jpg",
    upright: "권위, 안정, 통제, 아버지의 힘", reversed: "독재, 경직, 권위 남용",
    keywords: ["권위","안정","통제","질서"] },
  { id: "m05", suit: "major", num: 5,  nameKo: "교황", nameEn: "The Hierophant", image: "/tarot/major/05-hierophant.jpg",
    upright: "전통, 가르침, 영적 지도, 제도", reversed: "관습 거부, 위선, 자유로운 사고",
    keywords: ["전통","가르침","제도","신앙"] },
  { id: "m06", suit: "major", num: 6,  nameKo: "연인", nameEn: "The Lovers", image: "/tarot/major/06-lovers.jpg",
    upright: "사랑, 조화, 선택, 결합", reversed: "갈등, 부조화, 잘못된 선택",
    keywords: ["사랑","선택","조화","결합"] },
  { id: "m07", suit: "major", num: 7,  nameKo: "전차", nameEn: "The Chariot", image: "/tarot/major/07-chariot.jpg",
    upright: "승리, 의지력, 전진, 통제된 힘", reversed: "방향 상실, 좌절, 통제 불능",
    keywords: ["승리","전진","의지","결단"] },
  { id: "m08", suit: "major", num: 8,  nameKo: "힘", nameEn: "Strength", image: "/tarot/major/08-strength.jpg",
    upright: "내면의 힘, 용기, 인내, 부드러운 강함", reversed: "자기 의심, 약함, 폭주",
    keywords: ["힘","용기","인내","부드러움"] },
  { id: "m09", suit: "major", num: 9,  nameKo: "은둔자", nameEn: "The Hermit", image: "/tarot/major/09-hermit.jpg",
    upright: "내면 탐구, 고독, 지혜, 인도", reversed: "고립, 외로움, 회피",
    keywords: ["고독","성찰","지혜","빛"] },
  { id: "m10", suit: "major", num: 10, nameKo: "운명의 수레바퀴", nameEn: "Wheel of Fortune", image: "/tarot/major/10-wheel.jpg",
    upright: "변화, 운명, 순환, 행운의 전환", reversed: "정체, 불운, 통제 불가의 변화",
    keywords: ["운명","변화","순환","기회"] },
  { id: "m11", suit: "major", num: 11, nameKo: "정의", nameEn: "Justice", image: "/tarot/major/11-justice.jpg",
    upright: "공정, 균형, 진실, 인과응보", reversed: "불공정, 편견, 책임 회피",
    keywords: ["정의","균형","진실","결과"] },
  { id: "m12", suit: "major", num: 12, nameKo: "매달린 사람", nameEn: "The Hanged Man", image: "/tarot/major/12-hanged.jpg",
    upright: "관점 전환, 희생, 멈춤, 깨달음", reversed: "정체, 무의미한 희생, 집착",
    keywords: ["전환","희생","멈춤","통찰"] },
  { id: "m13", suit: "major", num: 13, nameKo: "죽음", nameEn: "Death", image: "/tarot/major/13-death.jpg",
    upright: "끝과 새 시작, 변형, 해방, 본질적 변화", reversed: "변화 거부, 정체, 두려움",
    keywords: ["변형","해방","끝","재생"] },
  { id: "m14", suit: "major", num: 14, nameKo: "절제", nameEn: "Temperance", image: "/tarot/major/14-temperance.jpg",
    upright: "균형, 조화, 중용, 인내", reversed: "불균형, 과잉, 조급함",
    keywords: ["조화","중용","균형","치유"] },
  { id: "m15", suit: "major", num: 15, nameKo: "악마", nameEn: "The Devil", image: "/tarot/major/15-devil.jpg",
    upright: "속박, 유혹, 욕망, 집착", reversed: "해방, 자각, 사슬 끊기",
    keywords: ["속박","유혹","욕망","집착"] },
  { id: "m16", suit: "major", num: 16, nameKo: "탑", nameEn: "The Tower", image: "/tarot/major/16-tower.jpg",
    upright: "갑작스런 붕괴, 충격, 진실의 폭로, 해방", reversed: "재앙 회피, 두려움, 변화 지연",
    keywords: ["붕괴","충격","폭로","각성"] },
  { id: "m17", suit: "major", num: 17, nameKo: "별", nameEn: "The Star", image: "/tarot/major/17-star.jpg",
    upright: "희망, 영감, 평온, 회복", reversed: "낙담, 신뢰 상실, 절망",
    keywords: ["희망","영감","평온","회복"] },
  { id: "m18", suit: "major", num: 18, nameKo: "달", nameEn: "The Moon", image: "/tarot/major/18-moon.jpg",
    upright: "환상, 무의식, 직관, 불안", reversed: "혼란 해소, 진실 발견, 두려움 극복",
    keywords: ["환상","무의식","직관","불안"] },
  { id: "m19", suit: "major", num: 19, nameKo: "태양", nameEn: "The Sun", image: "/tarot/major/19-sun.jpg",
    upright: "기쁨, 성공, 활력, 명료함", reversed: "지나친 낙관, 일시적 좌절, 빛 가림",
    keywords: ["기쁨","성공","활력","명료"] },
  { id: "m20", suit: "major", num: 20, nameKo: "심판", nameEn: "Judgement", image: "/tarot/major/20-judgement.jpg",
    upright: "각성, 부활, 부름, 결산", reversed: "자기 의심, 후회, 외면",
    keywords: ["각성","부활","결산","부름"] },
  { id: "m21", suit: "major", num: 21, nameKo: "세계", nameEn: "The World", image: "/tarot/major/21-world.jpg",
    upright: "완성, 성취, 통합, 여행의 끝", reversed: "미완성, 막바지 정체, 마무리 부족",
    keywords: ["완성","성취","통합","마무리"] },
];

const suitLabels: Record<Exclude<Suit,"major">, { ko: string; en: string }> = {
  wands: { ko: "지팡이", en: "Wands" },
  cups: { ko: "컵", en: "Cups" },
  swords: { ko: "검", en: "Swords" },
  pents: { ko: "펜타클", en: "Pentacles" },
};

const courtNames: Record<number, string> = { 11: "Page", 12: "Knight", 13: "Queen", 14: "King" };
const courtKo: Record<number, string> = { 11: "시종", 12: "기사", 13: "여왕", 14: "왕" };

const minorMeanings: Record<Exclude<Suit,"major">, { upright: string; reversed: string; keywords: string[] }> = {
  wands: {
    upright: "열정, 에너지, 영감, 행동력. 새로운 도전과 창조의 불꽃이 일어난다.",
    reversed: "정체, 좌절, 에너지 소진, 방향 상실.",
    keywords: ["불","열정","행동","창조"],
  },
  cups: {
    upright: "감정, 사랑, 직관, 관계. 마음의 흐름과 인연이 깊어진다.",
    reversed: "감정 억압, 실망, 관계의 균열, 환멸.",
    keywords: ["물","감정","사랑","직관"],
  },
  swords: {
    upright: "이성, 사고, 결단, 갈등. 명료한 판단이 필요한 시기.",
    reversed: "혼란, 자기 검열, 무력감, 비관적 사고.",
    keywords: ["바람","이성","사고","결단"],
  },
  pents: {
    upright: "물질, 안정, 결실, 노력. 현실적 기반이 단단해진다.",
    reversed: "재정 손실, 불안정, 물질적 집착, 정체.",
    keywords: ["흙","물질","결실","안정"],
  },
};

const buildMinor = (): TarotCard[] => {
  const out: TarotCard[] = [];
  (Object.keys(suitLabels) as Array<Exclude<Suit,"major">>).forEach((suit) => {
    const lbl = suitLabels[suit];
    const m = minorMeanings[suit];
    for (let n = 1; n <= 14; n++) {
      const numStr = String(n).padStart(2, "0");
      const cardName = n === 1 ? "Ace" : n <= 10 ? String(n) : courtNames[n];
      const cardKo = n === 1 ? "에이스" : n <= 10 ? `${n}` : courtKo[n];
      out.push({
        id: `${suit}-${numStr}`,
        suit, num: n,
        nameKo: `${lbl.ko}의 ${cardKo}`,
        nameEn: `${cardName} of ${lbl.en}`,
        image: `/tarot/minor/${suit}-${numStr}.jpg`,
        upright: m.upright,
        reversed: m.reversed,
        keywords: m.keywords,
      });
    }
  });
  return out;
};

export const TAROT_DECK: TarotCard[] = [...major, ...buildMinor()];

export interface DrawnCard {
  card: TarotCard;
  reversed: boolean;
}

export function shuffleAndDraw(count: number): DrawnCard[] {
  const indices = Array.from({ length: TAROT_DECK.length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, count).map((idx) => ({
    card: TAROT_DECK[idx],
    reversed: Math.random() < 0.3,
  }));
}

export interface SpreadDef {
  id: string;
  name: string;
  count: number;
  positions: string[];
  desc: string;
  free: boolean;
}

export const SPREADS: SpreadDef[] = [
  {
    id: "single",
    name: "오늘의 한 장",
    count: 1,
    positions: ["오늘의 메시지"],
    desc: "한 장의 카드로 오늘의 흐름을 읽습니다",
    free: true,
  },
  {
    id: "ppf",
    name: "과거 · 현재 · 미래",
    count: 3,
    positions: ["과거", "현재", "미래"],
    desc: "세 장으로 시간의 흐름을 봅니다",
    free: false,
  },
  {
    id: "celtic",
    name: "켈틱 크로스",
    count: 10,
    positions: ["현재 상황", "장애물", "먼 과거", "최근 과거", "가능한 미래", "가까운 미래", "당신", "환경", "희망과 두려움", "최종 결과"],
    desc: "10장의 정통 스프레드로 깊이 있는 통찰",
    free: false,
  },
];
