import { Solar, Lunar } from "lunar-typescript";

export interface SajuInput {
  birthdate: string;
  time?: string;
  calendar: "양력" | "음력";
  gender?: "여성" | "남성";
  isLeapMonth?: boolean;
  /** 출생지 경도 (예: 서울 126.98, 부산 129.08). 미입력 시 한국 표준시 그대로 사용 */
  longitude?: number;
}

/** 경도 보정값 (분). KST(135°) 기준 차이 × 4분/° */
export function trueSolarTimeOffset(longitude: number): number {
  const STANDARD_MERIDIAN = 135;
  return (longitude - STANDARD_MERIDIAN) * 4;
}

/**
 * 균시차(Equation of Time) — 평균태양시와 진태양시의 차이 (분)
 * Spencer(1971) 근사식, 정확도 ±1분 이내
 * 범위: 약 -14분 ~ +16분
 */
export function equationOfTime(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const N = Math.floor((date.getTime() - start.getTime()) / 86400000) + 1;
  const B = (2 * Math.PI * (N - 81)) / 365;
  return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
}

/**
 * 진태양시(眞太陽時) 보정: 경도 보정 + 균시차 보정 적용
 * - date 미전달 시 균시차 생략 (시간 미상인 경우)
 * - longitude 미전달 시 경도 보정 생략
 */
export function applyTrueSolarTime(
  hour: number,
  minute: number,
  longitude?: number,
  date?: Date
): { hour: number; minute: number } {
  if ((longitude === undefined || longitude === null) && !date) {
    return { hour, minute };
  }
  let offsetMin = 0;
  if (longitude !== undefined && longitude !== null) {
    offsetMin += trueSolarTimeOffset(longitude);
  }
  if (date) {
    offsetMin += equationOfTime(date);
  }
  let totalMin = hour * 60 + minute + Math.round(offsetMin);
  if (totalMin < 0) totalMin += 24 * 60;
  if (totalMin >= 24 * 60) totalMin -= 24 * 60;
  return {
    hour: Math.floor(totalMin / 60),
    minute: totalMin % 60,
  };
}

export interface PillarInfo {
  gan: string;
  zhi: string;
  ganzhi: string;
  diShi: string;
  hideGan: string[];
}

export interface DaYunInfo {
  startYear: number;
  endYear: number;
  startAge: number;
  endAge: number;
  ganzhi: string;
}

export interface SajuChart {
  solar: { year: number; month: number; day: number; hour: number; minute: number };
  lunar: { year: number; month: number; day: number; isLeap: boolean };
  pillars: { year: PillarInfo; month: PillarInfo; day: PillarInfo; hour: PillarInfo | null };
  dayMaster: { gan: string; wuxing: string };
  yearShengXiao: string;
  naYin: { year: string; month: string; day: string; hour: string | null };
  shiShen: { year: string; month: string; hour: string | null };
  wuxingCount: Record<string, number>;
  jieQi: string;
  xunKong: string;
  daYun: DaYunInfo[];
  formatted: string;
}

const STEM_TO_WUXING: Record<string, string> = {
  甲: "목", 乙: "목", 丙: "화", 丁: "화", 戊: "토", 己: "토",
  庚: "금", 辛: "금", 壬: "수", 癸: "수",
};
const BRANCH_TO_WUXING: Record<string, string> = {
  寅: "목", 卯: "목", 巳: "화", 午: "화", 辰: "토", 戌: "토",
  丑: "토", 未: "토", 申: "금", 酉: "금", 子: "수", 亥: "수",
};

export function calcSaju(input: SajuInput): SajuChart {
  const [yStr, mStr, dStr] = input.birthdate.split("-");
  const y = Number(yStr), m = Number(mStr), d = Number(dStr);
  const [hStr, minStr] = (input.time || "12:00").split(":");
  const rawHour = Number(hStr || 12);
  const rawMinute = Number(minStr || 0);

  // 진태양시 보정 (경도 + 균시차). 시간 미상 시 균시차 생략.
  const birthDate = input.time ? new Date(y, m - 1, d) : undefined;
  const { hour, minute } = applyTrueSolarTime(rawHour, rawMinute, input.longitude, birthDate);

  let solar: Solar;
  if (input.calendar === "음력") {
    const lunar = Lunar.fromYmdHms(y, input.isLeapMonth ? -m : m, d, hour, minute, 0);
    solar = lunar.getSolar();
  } else {
    solar = Solar.fromYmdHms(y, m, d, hour, minute, 0);
  }

  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();

  const buildPillar = (ganzhi: string, diShi: string, hideGan: string[]): PillarInfo => ({
    gan: ganzhi[0],
    zhi: ganzhi[1],
    ganzhi,
    diShi,
    hideGan,
  });

  const yearP = buildPillar(ec.getYear(), ec.getYearDiShi(), ec.getYearHideGan());
  const monthP = buildPillar(ec.getMonth(), ec.getMonthDiShi(), ec.getMonthHideGan());
  const dayP = buildPillar(ec.getDay(), ec.getDayDiShi(), ec.getDayHideGan());
  const hourP = input.time ? buildPillar(ec.getTime(), ec.getTimeDiShi(), ec.getTimeHideGan()) : null;

  const wuxingCount: Record<string, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  const addWuxing = (p: PillarInfo | null) => {
    if (!p) return;
    wuxingCount[STEM_TO_WUXING[p.gan]]++;
    wuxingCount[BRANCH_TO_WUXING[p.zhi]]++;
  };
  [yearP, monthP, dayP, hourP].forEach(addWuxing);

  let daYun: DaYunInfo[] = [];
  if (input.gender) {
    const genderNum = input.gender === "남성" ? 1 : 0;
    const yun = ec.getYun(genderNum);
    daYun = yun.getDaYun(8).map((du) => ({
      startYear: du.getStartYear(),
      endYear: du.getEndYear(),
      startAge: du.getStartAge(),
      endAge: du.getEndAge(),
      ganzhi: du.getGanZhi(),
    })).filter((du) => du.ganzhi);
  }

  const tstNote = input.time
    ? ` (진태양시+균시차 보정 → ${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")})`
    : "";
  const formattedParts = [
    `年柱(연주) ${annotateHanja(yearP.ganzhi)}`,
    `月柱(월주) ${annotateHanja(monthP.ganzhi)}`,
    `日柱(일주) ${annotateHanja(dayP.ganzhi)}`,
    hourP ? `時柱(시주) ${annotateHanja(hourP.ganzhi)}${tstNote}` : `時柱(시주) 미상`,
  ];

  return {
    solar: {
      year: solar.getYear(), month: solar.getMonth(), day: solar.getDay(),
      hour, minute,
    },
    lunar: {
      year: lunar.getYear(), month: Math.abs(lunar.getMonth()),
      day: lunar.getDay(), isLeap: lunar.getMonth() < 0,
    },
    pillars: { year: yearP, month: monthP, day: dayP, hour: hourP },
    dayMaster: { gan: dayP.gan, wuxing: STEM_TO_WUXING[dayP.gan] },
    yearShengXiao: lunar.getYearShengXiao(),
    naYin: {
      year: lunar.getYearNaYin(),
      month: lunar.getMonthNaYin(),
      day: lunar.getDayNaYin(),
      hour: input.time ? lunar.getTimeNaYin() : null,
    },
    shiShen: {
      year: ec.getYearShiShenGan(),
      month: ec.getMonthShiShenGan(),
      hour: input.time ? ec.getTimeShiShenGan() : null,
    },
    wuxingCount,
    jieQi: lunar.getPrevJieQi().toString(),
    xunKong: ec.getDayXunKong(),
    daYun,
    formatted: formattedParts.join(" · "),
  };
}

// 한자→한글 발음 변환 (천간/지지)
const HANJA_READING: Record<string, string> = {
  // 천간(天干)
  甲: "갑", 乙: "을", 丙: "병", 丁: "정", 戊: "무",
  己: "기", 庚: "경", 辛: "신", 壬: "임", 癸: "계",
  // 지지(地支)
  子: "자", 丑: "축", 寅: "인", 卯: "묘", 辰: "진", 巳: "사",
  午: "오", 未: "미", 申: "신", 酉: "유", 戌: "술", 亥: "해",
};

/** "庚午" → "庚午(경오)" 처럼 모든 천간·지지 한자에 한글 발음을 괄호로 붙임. */
export function annotateHanja(s: string): string {
  // 연속된 한자(천간/지지)를 그룹으로 잡아서 한 번에 표기
  return s.replace(/[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]+/g, (m) => {
    const reading = Array.from(m).map((ch) => HANJA_READING[ch] || ch).join("");
    return `${m}(${reading})`;
  });
}

export function formatSajuForPrompt(chart: SajuChart): string {
  const { pillars, dayMaster, wuxingCount, shiShen, lunar, yearShengXiao, naYin, jieQi, xunKong, daYun } = chart;
  const wuxingStr = Object.entries(wuxingCount).map(([k, v]) => `${k}:${v}`).join(" ");

  const pillarLine = (label: string, p: PillarInfo | null, naYinStr: string | null) => {
    if (!p) return `- ${label}: 미상`;
    const hideGanStr = p.hideGan.map((g) => `${g}(${HANJA_READING[g] || g})`).join(",");
    return `- ${label}: ${annotateHanja(p.ganzhi)} | 12운성:${p.diShi} | 지장간:[${hideGanStr}]${naYinStr ? ` | 납음:${naYinStr}` : ""}`;
  };

  const daYunStr = daYun.length
    ? `\n[대운(大運) 흐름]\n` + daYun.map((d) => `- ${d.startAge}세(${d.startYear}년)~${d.endAge}세(${d.endYear}년): ${annotateHanja(d.ganzhi)}`).join("\n")
    : "";

  const timeNote = chart.solar.hour !== undefined
    ? `\n- ⚠ 진태양시(眞太陽時) 보정 적용됨: 입력시각 → 보정시각 ${String(chart.solar.hour).padStart(2,"0")}:${String(chart.solar.minute).padStart(2,"0")}`
    : "";

  return `[명식 (만세력 정밀 계산)]
${pillarLine("년주", pillars.year, naYin.year)}
${pillarLine("월주", pillars.month, naYin.month)}
${pillarLine("일주", pillars.day, naYin.day)} ← 일간(日干) = ${dayMaster.gan}(${HANJA_READING[dayMaster.gan] || ""}, ${dayMaster.wuxing})
${pillarLine("시주", pillars.hour, naYin.hour)}
- 절기 기준: ${jieQi}
- 음력: ${lunar.year}년 ${lunar.isLeap ? "윤" : ""}${lunar.month}월 ${lunar.day}일 (${yearShengXiao}띠)
- 십신(천간): 년간=${shiShen.year}, 월간=${shiShen.month}, 시간=${shiShen.hour ?? "미상"}
- 오행 분포: ${wuxingStr}
- 일주 공망(空亡): ${xunKong}${timeNote}${daYunStr}`;
}
