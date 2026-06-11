import React from "react";
import {
  Document, Page, Text, View, Image, StyleSheet, Font, renderToBuffer,
} from "@react-pdf/renderer";
import path from "path";
import { readFileSync } from "fs";
import type { SajuChart } from "./saju";

// ── 폰트 등록 (KoPubWorld 바탕 — KS한자 포함) ────────────────────────────────
const fontDir = path.join(process.cwd(), "public", "fonts");
Font.register({
  family: "KoPub",
  fonts: [
    { src: path.join(fontDir, "KoPubBatang-Medium.ttf"), fontWeight: "normal" },
    { src: path.join(fontDir, "KoPubBatang-Bold.ttf"), fontWeight: "bold" },
  ],
});
// 한국어(CJK)는 글자 단위 줄바꿈 — 단어 통째 줄바꿈 시 텍스트 겹침/넘침 발생
Font.registerHyphenationCallback((word) => word.split(""));

// ── 색상 (react-pdf의 rgba 보더 버그 회피 — 전부 단색 hex) ───────────────────
const C = {
  ink:        "#14101F",  // 커버 배경
  gold:       "#C9A86A",
  goldMid:    "#9A8458",  // 커버 위 흐린 금색 텍스트/선
  goldLine:   "#5F5138",  // 커버 위 아주 흐린 금색 선
  onInkSoft:  "#94919E",  // 커버 위 흐린 흰색
  onInkFaint: "#67636F",
  onInkDim:   "#524E5B",
  paper:      "#FCFBF8",
  primary:    "#43356B",
  primarySoft:"#6A5A9E",
  text:       "#2A2433",
  muted:      "#7A7287",
  faint:      "#A9A2B5",
  line:       "#E2DDD2",
  lineSoft:   "#EDEAE0",
  white:      "#FFFFFF",
  dayBg:      "#F7F4FF",
};

// ── 스타일 ──────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  /* ─── 커버 ─── */
  coverPage: { backgroundColor: C.ink },
  coverFrame: {
    position: "absolute", top: 22, left: 22, right: 22, bottom: 22,
    border: `1pt solid ${C.goldMid}`,
  },
  coverFrameInner: {
    position: "absolute", top: 28, left: 28, right: 28, bottom: 28,
    border: `0.5pt solid ${C.goldLine}`,
  },
  cover: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 70, paddingVertical: 60,
  },
  coverArt: {
    width: 150, height: 150, borderRadius: 75,
    marginBottom: 30, objectFit: "cover",
    border: `1.5pt solid ${C.goldMid}`,
  },
  coverBrand: { fontFamily: "KoPub", fontSize: 10, color: C.goldMid, letterSpacing: 8, paddingLeft: 8, marginBottom: 6 },
  coverBrandEn: { fontFamily: "KoPub", fontSize: 7, color: C.goldLine, letterSpacing: 4, paddingLeft: 4, marginBottom: 34 },
  coverRule: { width: 64, borderBottom: `0.8pt solid ${C.goldMid}`, marginBottom: 34 },
  coverTitle: { fontFamily: "KoPub", fontWeight: "bold", fontSize: 44, color: C.gold, letterSpacing: 14, paddingLeft: 14, marginBottom: 10 },
  coverTitleSub: { fontFamily: "KoPub", fontSize: 10, color: C.onInkSoft, letterSpacing: 6, paddingLeft: 6, marginBottom: 44 },
  coverNameLabel: { fontFamily: "KoPub", fontSize: 8, color: C.goldMid, letterSpacing: 5, paddingLeft: 5, marginBottom: 8 },
  coverName: { fontFamily: "KoPub", fontWeight: "bold", fontSize: 26, color: C.white, letterSpacing: 10, paddingLeft: 10, marginBottom: 8 },
  coverBirth: { fontFamily: "KoPub", fontSize: 9.5, color: C.onInkSoft, letterSpacing: 1.5, marginBottom: 38 },
  coverPillars: {
    flexDirection: "row",
    borderTop: `0.8pt solid ${C.goldLine}`,
    borderBottom: `0.8pt solid ${C.goldLine}`,
    paddingVertical: 16, marginBottom: 40,
  },
  coverPillar: { width: 86, alignItems: "center" },
  coverPillarDivider: { borderLeft: `0.5pt solid ${C.goldLine}` },
  coverPillarLabel: { fontFamily: "KoPub", fontSize: 7.5, color: C.goldMid, letterSpacing: 2, marginBottom: 7 },
  coverPillarGanzhi: { fontFamily: "KoPub", fontWeight: "bold", fontSize: 22, color: C.white, letterSpacing: 4, paddingLeft: 4 },
  coverDate: { fontFamily: "KoPub", fontSize: 8, color: C.onInkFaint, letterSpacing: 2, marginBottom: 6 },
  coverNote: { fontFamily: "KoPub", fontSize: 7, color: C.onInkDim, textAlign: "center", lineHeight: 1.7 },

  /* ─── 본문 공통 ─── */
  page: {
    fontFamily: "KoPub", backgroundColor: C.paper,
    paddingTop: 58, paddingBottom: 76, paddingHorizontal: 58,
    fontSize: 10.5, color: C.text,
  },
  footer: {
    position: "absolute", bottom: 30, left: 58, right: 58,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderTop: `0.5pt solid ${C.line}`, paddingTop: 10,
  },
  footerBrand: { fontFamily: "KoPub", fontSize: 7.5, color: C.faint, letterSpacing: 3 },
  footerPage: { fontFamily: "KoPub", fontSize: 8, color: C.faint },

  pageTopRule: { flexDirection: "row", alignItems: "center", marginBottom: 26 },
  pageTopLine: { flex: 1, borderBottom: `0.6pt solid ${C.gold}` },
  pageTopDiamond: { fontFamily: "KoPub", fontSize: 8, color: C.gold, marginHorizontal: 10 },

  /* ─── 명식 요약 ─── */
  sumTitle: { fontFamily: "KoPub", fontWeight: "bold", fontSize: 16, color: C.primary, letterSpacing: 8, paddingLeft: 8, textAlign: "center", marginBottom: 4 },
  sumTitleSub: { fontFamily: "KoPub", fontSize: 8.5, color: C.muted, letterSpacing: 3, textAlign: "center", marginBottom: 26 },
  pillarsRow: { flexDirection: "row", justifyContent: "center", marginBottom: 26 },
  pillarCard: {
    width: 104, alignItems: "center",
    paddingVertical: 16, marginHorizontal: 5,
    backgroundColor: C.white,
    border: `0.8pt solid ${C.line}`,
    borderTop: `2pt solid ${C.primary}`,
  },
  pillarCardDay: {
    backgroundColor: C.dayBg,
    border: `0.8pt solid ${C.primarySoft}`,
    borderTop: `2pt solid ${C.primary}`,
  },
  pillarLabel: { fontFamily: "KoPub", fontSize: 7.5, color: C.muted, letterSpacing: 3, marginBottom: 9 },
  pillarGanzhi: { fontFamily: "KoPub", fontWeight: "bold", fontSize: 26, color: C.primary, letterSpacing: 3, paddingLeft: 3, marginBottom: 8 },
  pillarSub: { fontFamily: "KoPub", fontSize: 7.5, color: C.muted, letterSpacing: 1 },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 4 },
  infoCell: {
    width: "50%", flexDirection: "row",
    paddingVertical: 9, paddingHorizontal: 4,
    borderBottom: `0.5pt solid ${C.lineSoft}`,
  },
  infoKey: { fontFamily: "KoPub", fontSize: 8.5, color: C.muted, width: 86, letterSpacing: 1.5 },
  infoVal: { fontFamily: "KoPub", fontSize: 9.5, color: C.text, flex: 1 },
  daYunHead: { fontFamily: "KoPub", fontWeight: "bold", fontSize: 10.5, color: C.primary, letterSpacing: 3, marginTop: 24, marginBottom: 12 },
  daYunTable: { flexDirection: "row", flexWrap: "wrap" },
  daYunCell: {
    width: "25%", alignItems: "center",
    paddingVertical: 10,
    border: `0.4pt solid ${C.lineSoft}`,
    backgroundColor: C.white,
  },
  daYunGanzhi: { fontFamily: "KoPub", fontWeight: "bold", fontSize: 13, color: C.primary, letterSpacing: 2, paddingLeft: 2, marginBottom: 3 },
  daYunAge: { fontFamily: "KoPub", fontSize: 7.5, color: C.muted },

  /* ─── 차례 ─── */
  tocTitle: { fontFamily: "KoPub", fontWeight: "bold", fontSize: 16, color: C.primary, letterSpacing: 8, paddingLeft: 8, textAlign: "center", marginBottom: 4 },
  tocSub: { fontFamily: "KoPub", fontSize: 8.5, color: C.muted, letterSpacing: 3, textAlign: "center", marginBottom: 30 },
  tocRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 13,
    borderBottom: `0.5pt solid ${C.lineSoft}`,
  },
  tocIcon: {
    fontFamily: "KoPub", fontWeight: "bold", fontSize: 15, color: C.gold,
    width: 34, textAlign: "center",
  },
  tocChapterTitle: { fontFamily: "KoPub", fontWeight: "bold", fontSize: 11.5, color: C.text, letterSpacing: 1 },
  tocChapterDesc: { fontFamily: "KoPub", fontSize: 8, color: C.muted, marginTop: 3, letterSpacing: 0.5 },
  tocNum: { fontFamily: "KoPub", fontSize: 9, color: C.faint, marginLeft: "auto" },

  /* ─── 챕터 ─── */
  chHeader: { alignItems: "center", marginBottom: 28 },
  chIconWrap: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: C.primary,
    alignItems: "center", justifyContent: "center",
    marginBottom: 14,
  },
  chIcon: { fontFamily: "KoPub", fontWeight: "bold", fontSize: 24, color: C.gold, lineHeight: 1 },
  chTitle: { fontFamily: "KoPub", fontWeight: "bold", fontSize: 19, color: C.primary, letterSpacing: 5, paddingLeft: 5, marginBottom: 6 },
  chDesc: { fontFamily: "KoPub", fontSize: 8.5, color: C.muted, letterSpacing: 2 },
  chDivider: { flexDirection: "row", alignItems: "center", marginTop: 16, width: 180 },

  secWrap: { marginBottom: 6 },
  secHeadRow: { flexDirection: "row", alignItems: "center", marginTop: 16, marginBottom: 9 },
  secMark: { fontFamily: "KoPub", fontSize: 9, color: C.gold, marginRight: 7 },
  secTitle: { fontFamily: "KoPub", fontWeight: "bold", fontSize: 12, color: C.primary, letterSpacing: 1 },
  secHeadLine: { flex: 1, borderBottom: `0.5pt solid ${C.lineSoft}`, marginLeft: 12 },
  secBody: { fontFamily: "KoPub", fontSize: 10.5, color: C.text, lineHeight: 1.95, textAlign: "justify" },

  /* ─── 마지막 장 ─── */
  endPage: { backgroundColor: C.ink, alignItems: "center", justifyContent: "center" },
  endBrand: { fontFamily: "KoPub", fontSize: 22, color: C.gold, letterSpacing: 12, paddingLeft: 12, marginBottom: 14 },
  endText: { fontFamily: "KoPub", fontSize: 9, color: C.onInkSoft, textAlign: "center", lineHeight: 2 },
});

// ── 타입 ────────────────────────────────────────────────────────────────────
export interface PdfChapterResult {
  id: string;
  icon: string;
  title: string;
  desc: string;
  content: string;
}

export interface SajuPDFProps {
  name: string;
  birthdate: string;
  gender: string;
  calendar: string;
  pdfType: "core" | "full";
  chart: SajuChart;
  chapters: PdfChapterResult[];
  generatedAt: string;
}

// ── 중국어(간체) → 한글 표기 변환 ────────────────────────────────────────────
// lunar-typescript가 간체자를 반환하는데 KoPub 폰트는 KS한자만 지원 → 한글로 표시
const SHENGXIAO_KO: Record<string, string> = {
  鼠: "쥐", 牛: "소", 虎: "호랑이", 兔: "토끼", 龙: "용", 龍: "용",
  蛇: "뱀", 马: "말", 馬: "말", 羊: "양", 猴: "원숭이",
  鸡: "닭", 雞: "닭", 狗: "개", 猪: "돼지", 豬: "돼지",
};
const JIEQI_KO: Record<string, string> = {
  立春: "입춘", 雨水: "우수", 惊蛰: "경칩", 驚蟄: "경칩", 春分: "춘분",
  清明: "청명", 谷雨: "곡우", 穀雨: "곡우", 立夏: "입하", 小满: "소만",
  小滿: "소만", 芒种: "망종", 芒種: "망종", 夏至: "하지", 小暑: "소서",
  大暑: "대서", 立秋: "입추", 处暑: "처서", 處暑: "처서", 白露: "백로",
  秋分: "추분", 寒露: "한로", 霜降: "상강", 立冬: "입동", 小雪: "소설",
  大雪: "대설", 冬至: "동지", 小寒: "소한", 大寒: "대한",
};
const NAYIN_KO: Record<string, string> = {
  海中金: "해중금", 炉中火: "노중화", 爐中火: "노중화", 大林木: "대림목",
  路旁土: "노방토", 剑锋金: "검봉금", 劍鋒金: "검봉금", 山头火: "산두화",
  山頭火: "산두화", 涧下水: "간하수", 澗下水: "간하수", 城头土: "성두토",
  城頭土: "성두토", 白蜡金: "백랍금", 白蠟金: "백랍금", 杨柳木: "양류목",
  楊柳木: "양류목", 泉中水: "천중수", 井泉水: "정천수", 屋上土: "옥상토",
  霹雳火: "벽력화", 霹靂火: "벽력화", 松柏木: "송백목", 长流水: "장류수",
  長流水: "장류수", 沙中金: "사중금", 砂中金: "사중금", 山下火: "산하화",
  平地木: "평지목", 壁上土: "벽상토", 金箔金: "금박금", 覆灯火: "복등화",
  覆燈火: "복등화", 天河水: "천하수", 大驿土: "대역토", 大驛土: "대역토",
  钗钏金: "차천금", 釵釧金: "차천금", 桑柘木: "상자목", 大溪水: "대계수",
  沙中土: "사중토", 砂中土: "사중토", 天上火: "천상화", 石榴木: "석류목",
  大海水: "대해수",
};
const DISHI_KO: Record<string, string> = {
  长生: "장생", 長生: "장생", 沐浴: "목욕", 冠带: "관대", 冠帶: "관대",
  临官: "임관", 臨官: "임관", 帝旺: "제왕", 衰: "쇠", 病: "병",
  死: "사", 墓: "묘", 绝: "절", 絕: "절", 胎: "태", 养: "양", 養: "양",
};
const koShengXiao = (v: string) => SHENGXIAO_KO[v] || v;
const koJieQi = (v: string) => JIEQI_KO[v] || v;
const koNaYin = (v: string) => NAYIN_KO[v] ? `${NAYIN_KO[v]}` : v;
const koDiShi = (v: string) => DISHI_KO[v] || v;

// ── 콘텐츠 파싱 (✦ 섹션 단위) ────────────────────────────────────────────────
function parseContent(text: string): { header: string; body: string }[] {
  const sections: { header: string; body: string }[] = [];
  const parts = text.split(/(?=✦\s)/);
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const nlIdx = trimmed.indexOf("\n");
    if (nlIdx === -1) {
      sections.push({ header: trimmed.replace(/^✦\s*/, ""), body: "" });
    } else {
      sections.push({
        header: trimmed.slice(0, nlIdx).replace(/^✦\s*/, "").trim(),
        body: trimmed.slice(nlIdx + 1).trim(),
      });
    }
  }
  return sections;
}

// ── 공용 컴포넌트 ─────────────────────────────────────────────────────────────
function PageFooter({ name }: { name: string }) {
  return (
    <View style={S.footer} fixed>
      <Text style={S.footerBrand}>命理天月 · {name} 命書</Text>
      <Text style={S.footerPage} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function TopRule() {
  return (
    <View style={S.pageTopRule}>
      <View style={S.pageTopLine} />
      <Text style={S.pageTopDiamond}>◆</Text>
      <View style={S.pageTopLine} />
    </View>
  );
}

// ── 커버 ────────────────────────────────────────────────────────────────────
function CoverPage({ name, birthdate, gender, calendar, chart, generatedAt }: SajuPDFProps) {
  const [y, m, d] = birthdate.split("-");
  const birthStr = `${y}년 ${Number(m)}월 ${Number(d)}일 · ${calendar} · ${gender}`;
  const { year, month, day, hour: hp } = chart.pillars;
  const pillars = [
    { label: "年柱", ganzhi: year.ganzhi },
    { label: "月柱", ganzhi: month.ganzhi },
    { label: "日柱", ganzhi: day.ganzhi },
    { label: "時柱", ganzhi: hp ? hp.ganzhi : "未詳" },
  ];

  // Windows 경로를 URL로 해석하는 문제 회피 — Buffer로 직접 로드
  let coverArt: Buffer | null = null;
  try {
    coverArt = readFileSync(path.join(process.cwd(), "public", "char-myeongseo.png"));
  } catch { /* 이미지 없으면 생략 */ }

  return (
    <Page size="A4" style={S.coverPage}>
      <View style={S.coverFrame} />
      <View style={S.coverFrameInner} />
      <View style={S.cover}>
        {coverArt && <Image src={{ data: coverArt, format: "png" }} style={S.coverArt} />}
        <Text style={S.coverBrand}>命 理 天 月</Text>
        <Text style={S.coverBrandEn}>MYEONGRICHEONWOL</Text>
        <View style={S.coverRule} />
        <Text style={S.coverTitle}>命書</Text>
        <Text style={S.coverTitleSub}>사주 정밀 풀이서</Text>
        <Text style={S.coverNameLabel}>이 책의 주인</Text>
        <Text style={S.coverName}>{name}</Text>
        <Text style={S.coverBirth}>{birthStr}</Text>
        <View style={S.coverPillars}>
          {pillars.map((p, i) => (
            <View key={p.label} style={[S.coverPillar, ...(i > 0 ? [S.coverPillarDivider] : [])]}>
              <Text style={S.coverPillarLabel}>{p.label}</Text>
              <Text style={S.coverPillarGanzhi}>{p.ganzhi}</Text>
            </View>
          ))}
        </View>
        <Text style={S.coverDate}>{generatedAt}</Text>
        <Text style={S.coverNote}>
          만세력 정밀 계산과 AI 해석으로 빚은 한 권의 운명서{"\n"}
          엔터테인먼트 목적의 참고 자료입니다
        </Text>
      </View>
    </Page>
  );
}

// ── 명식 요약 ────────────────────────────────────────────────────────────────
function ChartSummaryPage({ chart, name }: { chart: SajuChart; name: string }) {
  const { year, month, day, hour: hp } = chart.pillars;
  const pillars = [
    { label: "年柱 · 연주", p: year, isDay: false },
    { label: "月柱 · 월주", p: month, isDay: false },
    { label: "日柱 · 일주", p: day, isDay: true },
    ...(hp ? [{ label: "時柱 · 시주", p: hp, isDay: false }] : []),
  ];
  const w = chart.wuxingCount;
  const info: { k: string; v: string }[] = [
    { k: "일간 (日干)", v: `${chart.dayMaster.gan} — ${chart.dayMaster.wuxing}의 기운` },
    { k: "띠", v: `${koShengXiao(chart.yearShengXiao)}띠` },
    { k: "음력 생일", v: `${chart.lunar.year}년 ${chart.lunar.month}월 ${chart.lunar.day}일${chart.lunar.isLeap ? " (윤달)" : ""}` },
    { k: "절기", v: chart.jieQi ? koJieQi(chart.jieQi) : "—" },
    { k: "오행 분포", v: `목 ${w["목"] || 0} · 화 ${w["화"] || 0} · 토 ${w["토"] || 0} · 금 ${w["금"] || 0} · 수 ${w["수"] || 0}` },
    { k: "공망 (空亡)", v: chart.xunKong || "—" },
    { k: "납음 · 일주", v: koNaYin(chart.naYin.day) },
    { k: "납음 · 연주", v: koNaYin(chart.naYin.year) },
  ];

  return (
    <Page size="A4" style={S.page}>
      <TopRule />
      <Text style={S.sumTitle}>사주 명식</Text>
      <Text style={S.sumTitleSub}>四柱命式 · {name}</Text>

      <View style={S.pillarsRow}>
        {pillars.map(({ label, p, isDay }) => (
          <View key={label} style={[S.pillarCard, ...(isDay ? [S.pillarCardDay] : [])]}>
            <Text style={S.pillarLabel}>{label}</Text>
            <Text style={S.pillarGanzhi}>{p.ganzhi}</Text>
            <Text style={S.pillarSub}>{p.diShi ? koDiShi(p.diShi) : " "}</Text>
          </View>
        ))}
      </View>

      <View style={S.infoGrid}>
        {info.map((row) => (
          <View key={row.k} style={S.infoCell}>
            <Text style={S.infoKey}>{row.k}</Text>
            <Text style={S.infoVal}>{row.v}</Text>
          </View>
        ))}
      </View>

      {chart.daYun.length > 0 && (
        <>
          <Text style={S.daYunHead}>대운 大運 — 10년 단위 큰 흐름</Text>
          <View style={S.daYunTable}>
            {chart.daYun.slice(0, 8).map((du) => (
              <View key={du.startYear} style={S.daYunCell}>
                <Text style={S.daYunGanzhi}>{du.ganzhi}</Text>
                <Text style={S.daYunAge}>{du.startAge}세 ~ {du.endAge}세</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <PageFooter name={name} />
    </Page>
  );
}

// ── 차례 ────────────────────────────────────────────────────────────────────
function TocPage({ chapters, name }: { chapters: PdfChapterResult[]; name: string }) {
  return (
    <Page size="A4" style={S.page}>
      <TopRule />
      <Text style={S.tocTitle}>차 례</Text>
      <Text style={S.tocSub}>目次</Text>
      {chapters.map((ch, i) => (
        <View key={ch.id} style={S.tocRow}>
          <Text style={S.tocIcon}>{ch.icon}</Text>
          <View>
            <Text style={S.tocChapterTitle}>{ch.title}</Text>
            <Text style={S.tocChapterDesc}>{ch.desc}</Text>
          </View>
          <Text style={S.tocNum}>{String(i + 1).padStart(2, "0")}</Text>
        </View>
      ))}
      <PageFooter name={name} />
    </Page>
  );
}

// ── 챕터 ────────────────────────────────────────────────────────────────────
function ChapterPage({ chapter, name }: { chapter: PdfChapterResult; name: string }) {
  const sections = parseContent(chapter.content);

  return (
    <Page size="A4" style={S.page} wrap>
      {/* 챕터 머리 — 첫 페이지에만 렌더 (fixed 아님 → 다음 페이지 본문과 안 겹침) */}
      <View style={S.chHeader}>
        <View style={S.chIconWrap}>
          <Text style={S.chIcon}>{chapter.icon}</Text>
        </View>
        <Text style={S.chTitle}>{chapter.title}</Text>
        <Text style={S.chDesc}>{chapter.desc}</Text>
        <View style={S.chDivider}>
          <View style={S.pageTopLine} />
          <Text style={S.pageTopDiamond}>◆</Text>
          <View style={S.pageTopLine} />
        </View>
      </View>

      {sections.length > 0 ? (
        sections.map((sec, i) => (
          <View key={i} style={S.secWrap}>
            {sec.header ? (
              <View style={S.secHeadRow} minPresenceAhead={48}>
                <Text style={S.secMark}>◆</Text>
                <Text style={S.secTitle}>{sec.header}</Text>
                <View style={S.secHeadLine} />
              </View>
            ) : null}
            {sec.body ? <Text style={S.secBody}>{sec.body}</Text> : null}
          </View>
        ))
      ) : (
        <Text style={S.secBody}>{chapter.content}</Text>
      )}

      <PageFooter name={name} />
    </Page>
  );
}

// ── 마지막 장 ────────────────────────────────────────────────────────────────
function EndPage() {
  return (
    <Page size="A4" style={S.endPage}>
      <View style={S.coverFrame} />
      <Text style={S.endBrand}>命理天月</Text>
      <Text style={S.endText}>
        하늘이 정한 때는 바꿀 수 없어도{"\n"}
        그 때를 살아가는 방법은 그대의 것입니다
      </Text>
    </Page>
  );
}

// ── 전체 문서 ─────────────────────────────────────────────────────────────────
function SajuPDFDocument(props: SajuPDFProps) {
  return (
    <Document
      title={`${props.name} 命書 — 사주 정밀 풀이`}
      author="명리천월"
      subject="사주팔자 AI 풀이"
      creator="명리천월 myeongricheonwol"
    >
      <CoverPage {...props} />
      <ChartSummaryPage chart={props.chart} name={props.name} />
      <TocPage chapters={props.chapters} name={props.name} />
      {props.chapters.map((ch) => (
        <ChapterPage key={ch.id} chapter={ch} name={props.name} />
      ))}
      <EndPage />
    </Document>
  );
}

// ── 렌더 ─────────────────────────────────────────────────────────────────────
export async function renderSajuPDF(props: SajuPDFProps): Promise<Uint8Array> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(SajuPDFDocument, props) as any;
  return renderToBuffer(element) as Promise<Uint8Array>;
}
