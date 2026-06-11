// PDF 렌더 테스트 — mock 데이터로 실제 생성해 확인
// 실행: npx tsx scripts/test-pdf.mjs
import { writeFileSync } from "node:fs";
import { renderSajuPDF } from "../app/lib/saju-pdf.tsx";
import { calcSaju } from "../app/lib/saju.ts";

const chart = calcSaju({
  birthdate: "1992-06-15",
  time: "08:30",
  calendar: "양력",
  gender: "여성",
  longitude: 126.98,
});

const mockBody = (label) => `✦ ${label} 첫 항목
庚午(경오) 년주의 정인(어머니 같은 보살핌의 기운)이 강하게 자리하고 있어요. 그대는 타고나길 사람을 품는 그릇이 큰 편이라, 주변에서 기대고 싶어 하는 사람이 많을 가능성이 높아요. 올해 5~7월 사이에는 이 기운이 더 강해져서, 10년 위 멘토 같은 어른에게서 뜻밖의 도움을 받을 수 있는 흐름이에요. 이 시기에는 회사 회식 같은 큰 자리보다 1:1 점심 자리에서 중요한 이야기가 오갈 가능성이 높으니, 만남을 미루지 마세요.

✦ ${label} 둘째 항목
戊辰(무진) 일주(자기 자신을 나타내는 자리)는 큰 산과 같은 묵직함을 의미해요. 한 번 마음을 정하면 쉽게 흔들리지 않는 성품이지만, 그만큼 변화가 필요한 순간에 망설이는 경향도 있어요. 30대 중후반, 특히 다음 대운(38세 이후)이 들어오면 직업적으로 큰 갈림길이 한 번 와요. 그때는 안정보다 확장을 선택하는 쪽이 사주의 흐름과 맞아요.

✦ ${label} 셋째 항목
재성(돈과 현실 감각을 뜻하는 기운)이 월지에 뿌리내리고 있어서, 돈이 급하게 들어오기보다 차곡차곡 쌓이는 형태예요. 투자를 한다면 단타보다는 적립식이 맞고, 올해 가을(申·酉월)에는 주식 비중을 30% 정도 줄이고 현금을 확보해 두는 편이 좋아요. 이력서나 포트폴리오 정리는 6월 전에 해두면 가을의 기회를 놓치지 않아요.

✦ ${label} 키워드 3개
첫째, 신뢰. 둘째, 확장. 셋째, 가을의 결단. 이 세 단어를 올해의 나침반으로 삼으세요.`;

const chapters = [
  { id: "general", icon: "命", title: "종합 풀이", desc: "사주 총평 · 대운 흐름 · 올해 운세", content: mockBody("종합") },
  { id: "love", icon: "緣", title: "사랑·인연", desc: "연애·결혼·배우자·궁합", content: mockBody("사랑") },
  { id: "daewoon", icon: "運", title: "대운 자세히", desc: "10년 단위 인생 큰 흐름", content: mockBody("대운") },
  { id: "thisyear", icon: "歲", title: "올해 자세히", desc: "12개월 월별 흐름", content: mockBody("올해") },
];

const buf = await renderSajuPDF({
  name: "홍길동",
  birthdate: "1992-06-15",
  gender: "여성",
  calendar: "양력",
  pdfType: "core",
  chart,
  chapters,
  generatedAt: "2026년 6월 11일",
});

writeFileSync("test-output.pdf", buf);
console.log("OK → test-output.pdf", buf.length, "bytes");
