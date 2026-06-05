import React from "react";
import {
  Document, Page, Text, View, StyleSheet, Font, renderToBuffer,
} from "@react-pdf/renderer";
import path from "path";
import type { SajuChart } from "./saju";

// ── 폰트 등록 ──────────────────────────────────────────────────────────────
const fontDir = path.join(process.cwd(), "public", "fonts");
Font.register({
  family: "NanumMyeongjo",
  fonts: [
    { src: path.join(fontDir, "NanumMyeongjo.ttf"), fontWeight: "normal" },
    { src: path.join(fontDir, "NanumMyeongjo-Bold.ttf"), fontWeight: "bold" },
  ],
});
Font.registerHyphenationCallback((word) => [word]); // 한국어 줄바꿈 비활성화

// ── 색상 ───────────────────────────────────────────────────────────────────
const C = {
  primary:    "#3D2C8D",
  primaryLt:  "#6B5CD0",
  gold:       "#9A7B3E",
  goldLt:     "#C8A870",
  text:       "#1A1520",
  muted:      "#6B6480",
  light:      "#A89EC0",
  divider:    "#DDD8EF",
  bg:         "#FDFCFF",
  accentBg:   "#F5F0FF",
  dark:       "#0D0820",
  white:      "#FFFFFF",
};

// ── 스타일 ──────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  // 커버 페이지
  cover: {
    backgroundColor: C.dark,
    padding: 55,
    minHeight: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  coverLogo: { fontFamily: "NanumMyeongjo", fontSize: 11, color: C.goldLt, letterSpacing: 6, marginBottom: 3 },
  coverLogoSub: { fontFamily: "NanumMyeongjo", fontSize: 8, color: "rgba(200,168,112,0.55)", letterSpacing: 3, marginBottom: 28 },
  coverDivider: { width: 200, borderBottom: "1pt solid rgba(200,168,112,0.35)", marginBottom: 28 },
  coverLabel: { fontFamily: "NanumMyeongjo", fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: 5, marginBottom: 12 },
  coverName: { fontFamily: "NanumMyeongjo", fontWeight: "bold", fontSize: 30, color: C.white, letterSpacing: 6, marginBottom: 8 },
  coverBirth: { fontFamily: "NanumMyeongjo", fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: 1, marginBottom: 32 },
  coverPillarsRow: {
    flexDirection: "row", gap: 16, marginBottom: 32,
    borderTop: "1pt solid rgba(200,168,112,0.25)",
    borderBottom: "1pt solid rgba(200,168,112,0.25)",
    paddingVertical: 16, paddingHorizontal: 10,
  },
  coverPillar: { alignItems: "center", width: 72 },
  coverPillarLabel: { fontFamily: "NanumMyeongjo", fontSize: 8, color: C.goldLt, letterSpacing: 1, marginBottom: 5 },
  coverPillarGanzhi: { fontFamily: "NanumMyeongjo", fontWeight: "bold", fontSize: 20, color: C.white, letterSpacing: 3 },
  coverFooterLabel: { fontFamily: "NanumMyeongjo", fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: 1, marginBottom: 4 },
  coverDisclaimer: { fontFamily: "NanumMyeongjo", fontSize: 7.5, color: "rgba(255,255,255,0.22)", textAlign: "center", lineHeight: 1.6 },

  // 명식 요약 페이지
  summaryPage: {
    fontFamily: "NanumMyeongjo", backgroundColor: C.bg,
    paddingTop: 60, paddingBottom: 70, paddingHorizontal: 55,
  },
  summaryTitle: { fontFamily: "NanumMyeongjo", fontWeight: "bold", fontSize: 14, color: C.primary, letterSpacing: 3, textAlign: "center", marginBottom: 22 },
  summaryPillarsBox: {
    flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 20,
    padding: 18, backgroundColor: C.accentBg,
    border: `1pt solid ${C.divider}`, borderRadius: 6,
  },
  summaryPillar: { alignItems: "center", width: 78 },
  summaryPillarLabel: { fontFamily: "NanumMyeongjo", fontSize: 7.5, color: C.muted, letterSpacing: 2, marginBottom: 5 },
  summaryPillarGanzhi: { fontFamily: "NanumMyeongjo", fontWeight: "bold", fontSize: 20, color: C.primary, letterSpacing: 2, marginBottom: 4 },
  summaryPillarSub: { fontFamily: "NanumMyeongjo", fontSize: 7.5, color: C.muted, textAlign: "center", lineHeight: 1.4 },
  infoRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  infoBox: { flex: 1, padding: 10, backgroundColor: "#F8F6FF", border: `1pt solid ${C.divider}`, borderRadius: 4 },
  infoLabel: { fontFamily: "NanumMyeongjo", fontSize: 7.5, color: C.muted, letterSpacing: 2, marginBottom: 4 },
  infoValue: { fontFamily: "NanumMyeongjo", fontSize: 10.5, color: C.text },
  daYunTitle: { fontFamily: "NanumMyeongjo", fontWeight: "bold", fontSize: 10, color: C.primary, letterSpacing: 2, marginTop: 14, marginBottom: 8 },
  daYunRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  daYunChip: { padding: "4pt 8pt", backgroundColor: C.accentBg, border: `1pt solid ${C.divider}`, borderRadius: 4, marginBottom: 4 },
  daYunChipText: { fontFamily: "NanumMyeongjo", fontSize: 9, color: C.primary },

  // 챕터 페이지
  page: {
    fontFamily: "NanumMyeongjo", backgroundColor: C.bg,
    paddingTop: 55, paddingBottom: 65, paddingHorizontal: 55,
    fontSize: 10.5, color: C.text, lineHeight: 1.85,
  },
  pageHeader: {
    flexDirection: "row", alignItems: "center",
    marginBottom: 18, paddingBottom: 12, borderBottom: `2pt solid ${C.primary}`,
  },
  chapterIcon: { fontFamily: "NanumMyeongjo", fontSize: 26, color: C.primary, marginRight: 12, lineHeight: 1, width: 32 },
  chapterTitleWrap: { flex: 1 },
  chapterTitle: { fontFamily: "NanumMyeongjo", fontWeight: "bold", fontSize: 17, color: C.primary, letterSpacing: 2 },
  chapterSubtitle: { fontFamily: "NanumMyeongjo", fontSize: 9, color: C.muted, letterSpacing: 1, marginTop: 2 },
  sectionHeader: { fontFamily: "NanumMyeongjo", fontWeight: "bold", fontSize: 11.5, color: C.primaryLt, marginTop: 14, marginBottom: 5, letterSpacing: 0.5 },
  sectionBody: { fontFamily: "NanumMyeongjo", fontSize: 10.5, color: C.text, lineHeight: 1.85, marginBottom: 4 },

  // 푸터
  footer: {
    position: "absolute", bottom: 24, left: 55, right: 55,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  footerLogo: { fontFamily: "NanumMyeongjo", fontSize: 8, color: C.light, letterSpacing: 2 },
  footerPage: { fontFamily: "NanumMyeongjo", fontSize: 8, color: C.light },
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

// ── 콘텐츠 파싱 (✦ Section\n내용) ──────────────────────────────────────────
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
      const header = trimmed.slice(0, nlIdx).replace(/^✦\s*/, "").trim();
      const body = trimmed.slice(nlIdx + 1).trim();
      sections.push({ header, body });
    }
  }
  return sections;
}

// ── 커버 페이지 ─────────────────────────────────────────────────────────────
function CoverPage({ name, birthdate, gender, calendar, chart, generatedAt, pdfType }: SajuPDFProps) {
  const [y, m, d] = birthdate.split("-");
  const birthStr = `${y}년 ${Number(m)}월 ${Number(d)}일 · ${gender} · ${calendar}`;
  const { year, month, day, hour: hp } = chart.pillars;
  const pillars = [
    { label: "年柱", ganzhi: year.ganzhi },
    { label: "月柱", ganzhi: month.ganzhi },
    { label: "日柱", ganzhi: day.ganzhi },
    { label: "時柱", ganzhi: hp ? hp.ganzhi : "미상" },
  ];
  const typeLabel = pdfType === "full" ? "전체 정밀 풀이" : "코어 정밀 풀이";

  return (
    <Page size="A4">
      <View style={S.cover}>
        <Text style={S.coverLogo}>命理天月</Text>
        <Text style={S.coverLogoSub}>MYEONGRICHEONWOL</Text>
        <View style={S.coverDivider} />
        <Text style={S.coverLabel}>{typeLabel.toUpperCase()}</Text>
        <Text style={S.coverName}>{name}</Text>
        <Text style={S.coverBirth}>{birthStr}</Text>
        <View style={S.coverPillarsRow}>
          {pillars.map((p) => (
            <View key={p.label} style={S.coverPillar}>
              <Text style={S.coverPillarLabel}>{p.label}</Text>
              <Text style={S.coverPillarGanzhi}>{p.ganzhi}</Text>
            </View>
          ))}
        </View>
        <Text style={S.coverFooterLabel}>{generatedAt} 생성</Text>
        <Text style={S.coverDisclaimer}>
          사주 풀이는 만세력 정밀 계산 후 AI 해석으로 작성되었습니다{"\n"}
          엔터테인먼트 목적의 참고 자료이며 법적 효력이 없습니다
        </Text>
      </View>
    </Page>
  );
}

// ── 명식 요약 페이지 ─────────────────────────────────────────────────────────
function ChartSummaryPage({ chart, name }: { chart: SajuChart; name: string }) {
  const { year, month, day, hour: hp } = chart.pillars;
  const pillars = [
    { label: "年柱", p: year },
    { label: "月柱", p: month },
    { label: "日柱", p: day },
    ...(hp ? [{ label: "時柱", p: hp }] : []),
  ];
  const wuxing = chart.wuxingCount;

  return (
    <Page size="A4" style={S.summaryPage}>
      <Text style={S.summaryTitle}>✦ 사주 명식 ✦</Text>

      {/* 팔자 표 */}
      <View style={S.summaryPillarsBox}>
        {pillars.map(({ label, p }) => (
          <View key={label} style={S.summaryPillar}>
            <Text style={S.summaryPillarLabel}>{label}</Text>
            <Text style={S.summaryPillarGanzhi}>{p.ganzhi}</Text>
            <Text style={S.summaryPillarSub}>{p.diShi || ""}</Text>
          </View>
        ))}
      </View>

      {/* 기본 정보 */}
      <View style={S.infoRow}>
        <View style={S.infoBox}>
          <Text style={S.infoLabel}>일간 (日干)</Text>
          <Text style={S.infoValue}>{chart.dayMaster.gan} — {chart.dayMaster.wuxing}의 기운</Text>
        </View>
        <View style={S.infoBox}>
          <Text style={S.infoLabel}>음력 생일</Text>
          <Text style={S.infoValue}>
            {chart.lunar.year}년 {chart.lunar.month}월 {chart.lunar.day}일{chart.lunar.isLeap ? " (윤달)" : ""}
          </Text>
        </View>
      </View>
      <View style={S.infoRow}>
        <View style={S.infoBox}>
          <Text style={S.infoLabel}>오행 분포</Text>
          <Text style={S.infoValue}>
            목{wuxing["목"] || 0} 화{wuxing["화"] || 0} 토{wuxing["토"] || 0} 금{wuxing["금"] || 0} 수{wuxing["수"] || 0}
          </Text>
        </View>
        <View style={S.infoBox}>
          <Text style={S.infoLabel}>공망 (空亡)</Text>
          <Text style={S.infoValue}>{chart.xunKong || "—"}</Text>
        </View>
      </View>
      <View style={S.infoRow}>
        <View style={S.infoBox}>
          <Text style={S.infoLabel}>띠 / 절기</Text>
          <Text style={S.infoValue}>{chart.yearShengXiao}띠 · {chart.jieQi || "—"}</Text>
        </View>
        <View style={S.infoBox}>
          <Text style={S.infoLabel}>납음 (納音) · 일주</Text>
          <Text style={S.infoValue}>{chart.naYin.day}</Text>
        </View>
      </View>

      {/* 대운 */}
      {chart.daYun.length > 0 && (
        <>
          <Text style={S.daYunTitle}>대운 (大運) 흐름</Text>
          <View style={S.daYunRow}>
            {chart.daYun.slice(0, 8).map((du) => (
              <View key={du.startYear} style={S.daYunChip}>
                <Text style={S.daYunChipText}>
                  {du.ganzhi} ({du.startAge}~{du.endAge}세)
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* 푸터 */}
      <View style={S.footer} fixed>
        <Text style={S.footerLogo}>명리천월 命理天月</Text>
        <Text style={S.footerPage} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </View>
    </Page>
  );
}

// ── 챕터 페이지 ──────────────────────────────────────────────────────────────
function ChapterPage({ chapter }: { chapter: PdfChapterResult }) {
  const sections = parseContent(chapter.content);

  return (
    <Page size="A4" style={S.page} wrap>
      {/* 챕터 헤더 */}
      <View style={S.pageHeader} fixed>
        <Text style={S.chapterIcon}>{chapter.icon}</Text>
        <View style={S.chapterTitleWrap}>
          <Text style={S.chapterTitle}>{chapter.title}</Text>
          <Text style={S.chapterSubtitle}>{chapter.desc}</Text>
        </View>
      </View>

      {/* 섹션별 콘텐츠 */}
      {sections.length > 0
        ? sections.map((sec, i) => (
            <View key={i} wrap={false}>
              {sec.header && <Text style={S.sectionHeader}>✦ {sec.header}</Text>}
              {sec.body && <Text style={S.sectionBody}>{sec.body}</Text>}
            </View>
          ))
        : <Text style={S.sectionBody}>{chapter.content}</Text>
      }

      {/* 푸터 */}
      <View style={S.footer} fixed>
        <Text style={S.footerLogo}>명리천월 命理天月</Text>
        <Text style={S.footerPage} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </View>
    </Page>
  );
}

// ── 전체 문서 ─────────────────────────────────────────────────────────────────
function SajuPDFDocument(props: SajuPDFProps) {
  return (
    <Document
      title={`${props.name} 사주 정밀 풀이`}
      author="명리천월"
      subject="사주팔자 AI 풀이"
      creator="명리천월 myeongricheonwol.com"
    >
      <CoverPage {...props} />
      <ChartSummaryPage chart={props.chart} name={props.name} />
      {props.chapters.map((ch) => (
        <ChapterPage key={ch.id} chapter={ch} />
      ))}
    </Document>
  );
}

// ── 외부 호출 함수 ────────────────────────────────────────────────────────────
export async function renderSajuPDF(props: SajuPDFProps): Promise<Uint8Array> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(SajuPDFDocument, props) as any;
  return renderToBuffer(element) as Promise<Uint8Array>;
}
