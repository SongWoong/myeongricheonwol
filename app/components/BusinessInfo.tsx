/* 전자상거래법상 필수 사업자정보 푸터.
 * .env 또는 .env.local 에 NEXT_PUBLIC_BIZ_* 값을 채우면 자동 노출.
 * 값이 비어 있으면 placeholder 가 보이므로 운영 전 반드시 채울 것.
 *
 * 필요 환경변수:
 *   NEXT_PUBLIC_BIZ_COMPANY        상호
 *   NEXT_PUBLIC_BIZ_CEO            대표자
 *   NEXT_PUBLIC_BIZ_REG_NO         사업자등록번호
 *   NEXT_PUBLIC_BIZ_ECOMMERCE_NO   통신판매업 신고번호
 *   NEXT_PUBLIC_BIZ_ADDRESS        사업장 주소
 *   NEXT_PUBLIC_BIZ_PHONE          고객센터 전화번호
 *   NEXT_PUBLIC_BIZ_EMAIL          고객센터 이메일
 *   NEXT_PUBLIC_BIZ_CPO            개인정보책임자(선택)
 */
const FALLBACK = "(준비 중 — .env에 값 설정 필요)";

export function BusinessInfo({ compact = false }: { compact?: boolean }) {
  const v = (k: string) => (process.env[`NEXT_PUBLIC_BIZ_${k}`] || "").trim() || FALLBACK;
  const company = v("COMPANY");
  const ceo = v("CEO");
  const regNo = v("REG_NO");
  const ecommerceNo = v("ECOMMERCE_NO");
  const address = v("ADDRESS");
  const phone = v("PHONE");
  const email = v("EMAIL");
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
