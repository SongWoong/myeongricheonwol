import { astro } from "iztro";
import { applyTrueSolarTime } from "./saju";

export interface JamiInput {
  birthdate: string;
  hour: number;
  minute: number;
  calendar: "양력" | "음력";
  isLeapMonth?: boolean;
  gender: "여성" | "남성";
  /** 출생지 경도 (예: 서울 126.98, 부산 129.08). 미입력 시 한국 표준시 그대로 사용 */
  longitude?: number;
}

export interface JamiPalace {
  name: string;
  ganzhi: string;
  isOriginal: boolean;
  isBody: boolean;
  majorStars: { name: string; brightness: string }[];
  minorStars: string[];
}

export interface JamiChart {
  solar: string;
  lunar: string;
  chinese: string;
  fiveElementsClass: string;
  soulPalaceBranch: string;
  bodyPalaceBranch: string;
  zodiac: string;
  sign: string;
  palaces: JamiPalace[];
  /** 진태양시 보정 적용 여부 및 보정 시각 */
  correctedTime?: string;
}

const hourToTimeIndex = (hour: number): number => {
  if (hour === 23 || hour === 0) return 0;
  return Math.floor((hour + 1) / 2);
};

export function calcJami(input: JamiInput): JamiChart {
  // 진태양시 보정 적용
  const { hour, minute } = applyTrueSolarTime(input.hour, input.minute, input.longitude);
  const timeIndex = hourToTimeIndex(hour);
  const genderName = input.gender === "남성" ? "男" : "女";

  const a = input.calendar === "음력"
    ? astro.astrolabeByLunarDate(input.birthdate, timeIndex, genderName, input.isLeapMonth || false, true, "ko-KR")
    : astro.astrolabeBySolarDate(input.birthdate, timeIndex, genderName, true, "ko-KR");

  return {
    solar: a.solarDate,
    lunar: a.lunarDate,
    chinese: a.chineseDate,
    fiveElementsClass: a.fiveElementsClass,
    soulPalaceBranch: a.earthlyBranchOfSoulPalace,
    bodyPalaceBranch: a.earthlyBranchOfBodyPalace,
    zodiac: a.zodiac,
    sign: a.sign,
    correctedTime: input.longitude !== undefined && input.longitude !== null
      ? `${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}`
      : undefined,
    palaces: a.palaces.map((p) => ({
      name: p.name,
      ganzhi: `${p.heavenlyStem}${p.earthlyBranch}`,
      isOriginal: p.isOriginalPalace,
      isBody: p.isBodyPalace,
      majorStars: p.majorStars.map((s) => ({
        name: s.name,
        brightness: s.brightness || "",
      })),
      minorStars: p.minorStars.slice(0, 4).map((s) => s.name),
    })),
  };
}

export function formatJamiForPrompt(chart: JamiChart): string {
  const palacesStr = chart.palaces.map((p) => {
    const major = p.majorStars.length
      ? p.majorStars.map((s) => `${s.name}${s.brightness ? `(${s.brightness})` : ""}`).join("·")
      : "(공궁)";
    const minor = p.minorStars.length ? ` 보좌:${p.minorStars.join(",")}` : "";
    const flags = (p.isOriginal ? "[원국]" : "") + (p.isBody ? "[신궁]" : "");
    return `${p.name}궁(${p.ganzhi})${flags} 주성:${major}${minor}`;
  }).join("\n");

  const tstNote = chart.correctedTime
    ? `\n- ⚠ 진태양시(眞太陽時) 보정 적용됨: 보정시각 ${chart.correctedTime}`
    : "";

  return `[자미두수 명반 (정밀 계산)]
- 양력: ${chart.solar}
- 음력: ${chart.lunar}
- 사주: ${chart.chinese}
- 오행국: ${chart.fiveElementsClass}
- 명궁(命宮) 지지: ${chart.soulPalaceBranch}
- 신궁(身宮) 지지: ${chart.bodyPalaceBranch}
- 띠: ${chart.zodiac}, 별자리: ${chart.sign}${tstNote}

[12궁 배치]
${palacesStr}`;
}
