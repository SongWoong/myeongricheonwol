"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LEGAL_STYLES } from "@/app/lib/legal-styles";

export default function RefundPage() {
  const router = useRouter();
  return (
    <>
      <style>{LEGAL_STYLES}</style>
      <div className="app">
        <header>
          <button className="back" onClick={() => router.back()} aria-label="뒤로">←</button>
          <div>
            <div className="h-title">환불정책</div>
            <div className="h-sub">REFUND POLICY</div>
          </div>
        </header>
        <div className="content">
          <div className="doc-title">환불정책</div>
          <div className="doc-sub">Refund Policy · 시행일 2026.04.22</div>

          <div className="section">
            <h2>제1조 (목적)</h2>
            <p>본 환불정책은 명리천월(이하 &ldquo;회사&rdquo;)의 유료 풀이 서비스 환불 처리에 관한 사항을 규정함을 목적으로 합니다.</p>
          </div>

          <div className="section">
            <h2>제2조 (환불의 종류 및 조건)</h2>
            <table className="terms">
              <thead><tr><th>구분</th><th>환불 가능 여부</th><th>환불 비율</th></tr></thead>
              <tbody>
                <tr>
                  <td>결제 후 풀이 결과 미생성</td>
                  <td>✅ 가능</td>
                  <td>100%</td>
                </tr>
                <tr>
                  <td>결제 후 7일 이내 + 풀이 결과 미열람</td>
                  <td>✅ 가능</td>
                  <td>100%</td>
                </tr>
                <tr>
                  <td>풀이 결과를 이미 열람한 경우</td>
                  <td>❌ 원칙적 불가</td>
                  <td>—</td>
                </tr>
                <tr>
                  <td>시스템 오류로 풀이가 중단·잘림</td>
                  <td>✅ 재생성 또는 환불</td>
                  <td>100% 또는 재생성</td>
                </tr>
              </tbody>
            </table>
            <div className="notice">
              <strong>유료 풀이는 디지털 콘텐츠 특성상 한 번 열람·소비한 이후에는 환불이 어렵습니다.</strong> 결제 전에 미리보기·무료 챕터로 서비스 품질을 확인하실 수 있습니다.
            </div>
          </div>

          <div className="section">
            <h2>제3조 (환불 신청 방법)</h2>
            <ol>
              <li>운영자에게 결제 정보(결제일·금액·풀이 종류)와 환불 사유를 알려주세요.</li>
              <li>접수 후 영업일 기준 3일 이내에 환불 가능 여부를 회신합니다.</li>
              <li>환불이 승인되면 결제 수단으로 7영업일 이내에 환불됩니다.</li>
            </ol>
          </div>

          <div className="section">
            <h2>제4조 (환불 예외)</h2>
            <p>다음의 경우에는 환불이 제한될 수 있습니다.</p>
            <ol>
              <li>이용자의 단순 변심으로 풀이 결과를 이미 열람한 경우</li>
              <li>풀이 내용이 이용자의 기대와 다르다는 주관적 이유</li>
              <li>이용자의 잘못된 정보 입력으로 발생한 결과</li>
              <li>약관 위반으로 이용 제한된 계정의 결제건</li>
            </ol>
          </div>

          <div className="section">
            <h2>제5조 (회사의 사유로 인한 환불)</h2>
            <p>다음의 경우에는 회사가 적극적으로 환불을 안내합니다.</p>
            <ol>
              <li>장시간(48시간 이상) 서비스 장애로 풀이 이용이 불가능한 경우</li>
              <li>결제는 완료되었으나 풀이 결과가 정상적으로 생성되지 않은 경우</li>
              <li>회사의 잘못으로 동일 풀이가 중복 결제된 경우</li>
            </ol>
          </div>

          <div className="section">
            <h2>제6조 (소비자 분쟁)</h2>
            <p>본 환불 정책으로 분쟁이 해결되지 않을 경우, 「전자상거래 등에서의 소비자보호에 관한 법률」 및 한국소비자원의 분쟁 조정 절차를 이용할 수 있습니다.</p>
          </div>

          <div className="legal-nav">
            <Link href="/terms">이용약관</Link>
            <Link href="/privacy">개인정보처리방침</Link>
            <Link href="/">홈으로</Link>
          </div>

          <div className="footer-meta">
            명리천월 (命理天月)<br />
            시행일: 2026년 4월 22일
          </div>
        </div>
      </div>
    </>
  );
}
