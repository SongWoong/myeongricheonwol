/* 전자상거래법상 필수 사업자정보 푸터.
 * .env 또는 .env.local 에 NEXT_PUBLIC_BIZ_* 값을 채우면 자동 노출.
 * 값이 비어 있으면 placeholder 가 보이므로 운영 전 반드시 채울 것.
 *
 * NOTE: process.env 는 반드시 리터럴 키로 접근해야 Next.js 가 빌드 타임에
 * 인라인한다. process.env[`NEXT_PUBLIC_BIZ_${k}`] 같은 동적 접근은 안 됨.
 */
const FALLBACK = "(준비 중 — .env에 값 설정 필요)";

function pick(value: string | undefined): string {
  return (value || "").trim() || FALLBACK;
}

export function BusinessInfo({ compact = false }: { compact?: boolean }) {
  const company = pick(process.env.NEXT_PUBLIC_BIZ_COMPANY);
  const ceo = pick(process.env.NEXT_PUBLIC_BIZ_CEO);
  const regNo = pick(process.env.NEXT_PUBLIC_BIZ_REG_NO);
  const ecommerceNo = pick(process.env.NEXT_PUBLIC_BIZ_ECOMMERCE_NO);
  const address = pick(process.env.NEXT_PUBLIC_BIZ_ADDRESS);
  const phone = pick(process.env.NEXT_PUBLIC_BIZ_PHONE);
  const email = pick(process.env.NEXT_PUBLIC_BIZ_EMAIL);
  const cpo = (process.env.NEXT_PUBLIC_BIZ_CPO || "").trim();

  const baseStyle: React.CSSProperties = {
    fontFamily: "sans-serif",
    fontSize: compact ? 10 : 11,
    color: "rgba(255,255,255,0.5)",
    lineHeight: 1.7,
    letterSpacing: 0.2,
    textAlign: compact ? "center" : "left",
  };

  return (
    <div style={baseStyle}>
      <div><strong style={{ color: "rgba(255,255,255,0.7)" }}>{company}</strong> · 대표 {ceo}</div>
      <div>사업자등록번호 {regNo} · 통신판매업신고 {ecommerceNo}</div>
      <div>{address}</div>
      <div>고객센터 {phone} · {email}{cpo ? ` · 개인정보책임자 ${cpo}` : ""}</div>
    </div>
  );
}
