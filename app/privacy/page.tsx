"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LEGAL_STYLES } from "@/app/lib/legal-styles";

export default function PrivacyPage() {
  const router = useRouter();
  return (
    <>
      <style>{LEGAL_STYLES}</style>
      <div className="app">
        <header>
          <button className="back" onClick={() => router.back()} aria-label="뒤로">←</button>
          <div>
            <div className="h-title">개인정보처리방침</div>
            <div className="h-sub">PRIVACY POLICY</div>
          </div>
        </header>
        <div className="content">
          <div className="doc-title">개인정보처리방침</div>
          <div className="doc-sub">Privacy Policy · 시행일 2026.04.22</div>

          <div className="section">
            <p>명리천월(이하 &ldquo;회사&rdquo;)은 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보처리방침을 수립·공개합니다.</p>
          </div>

          <div className="section">
            <h2>제1조 (개인정보의 처리 목적)</h2>
            <p>회사는 다음의 목적으로 개인정보를 처리하며, 처리 목적이 변경되는 경우 사전에 공지합니다.</p>
            <ol>
              <li>풀이 서비스 제공 (사주·자미두수·타로 명식 계산 및 해석)</li>
              <li>유료 서비스 결제 및 환불 처리</li>
              <li>이용 제한·통계 산출 (무료 사용 횟수 관리)</li>
              <li>성인 콘텐츠(밀서) 이용 시 만 19세 이상 여부 확인</li>
              <li>고객 문의 응대</li>
            </ol>
          </div>

          <div className="section">
            <h2>제2조 (수집하는 개인정보 항목 및 수집 방법)</h2>
            <table className="terms">
              <thead><tr><th>구분</th><th>항목</th><th>수집 방법</th></tr></thead>
              <tbody>
                <tr><td>풀이 입력</td><td>이름(닉네임 가능), 생년월일, 출생 시간(선택), 성별, 양/음력</td><td>이용자 직접 입력</td></tr>
                <tr><td>꿈 해몽</td><td>꿈 내용 텍스트</td><td>이용자 직접 입력</td></tr>
                <tr><td>타로</td><td>질문 텍스트</td><td>이용자 직접 입력</td></tr>
                <tr><td>자동 수집</td><td>접속 IP, 쿠키, 브라우저 정보, 이용 일시</td><td>서비스 이용 과정에서 자동 생성</td></tr>
              </tbody>
            </table>
            <p>※ 회사는 이메일·전화번호 등 직접적 식별정보를 별도로 수집하지 않습니다(로그인 도입 전 기준).</p>
          </div>

          <div className="section">
            <h2>제3조 (개인정보의 처리 및 보유 기간)</h2>
            <ol>
              <li>풀이 입력 정보는 풀이 생성 후 즉시 처리되며, <strong>회사 서버에 별도 저장하지 않습니다</strong>.</li>
              <li>풀이 결과 캐시 및 이용 횟수 기록은 <strong>이용자 본인 브라우저(localStorage)</strong>에만 저장되며, 이용자가 삭제하면 즉시 제거됩니다.</li>
              <li>접속 로그는 통신비밀보호법에 따라 3개월간 보관 후 파기합니다.</li>
              <li>유료 결제 정보는 전자상거래법에 따라 5년간 보관합니다.</li>
            </ol>
          </div>

          <div className="section">
            <h2>제4조 (개인정보의 제3자 제공 및 처리 위탁)</h2>
            <div className="notice">
              <strong>중요:</strong> 풀이 생성 과정에서 입력 정보가 AI 처리를 위해 외부 업체로 전송됩니다. 이용자는 서비스 이용 시 이에 동의하는 것으로 간주됩니다.
            </div>
            <table className="terms">
              <thead><tr><th>수탁 업체</th><th>위탁 업무</th><th>전송 항목</th></tr></thead>
              <tbody>
                <tr>
                  <td>Anthropic, PBC<br/>(미국)</td>
                  <td>AI 풀이 텍스트 생성<br/>(Claude API)</td>
                  <td>이름, 생년월일, 성별, 명식 데이터, 꿈/질문 텍스트</td>
                </tr>
              </tbody>
            </table>
            <p>※ Anthropic은 자체 개인정보 처리방침에 따라 데이터를 처리하며, 회사 결제 플랜에서는 사용자 입력이 모델 학습에 사용되지 않습니다. 자세한 내용은 <a href="https://www.anthropic.com/legal/privacy" style={{color:"#a0c0ff"}}>Anthropic 개인정보 처리방침</a>을 참고하세요.</p>
            <p>회사는 위 위탁 업무 외에는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.</p>
          </div>

          <div className="section">
            <h2>제5조 (정보주체의 권리·의무)</h2>
            <p>이용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
            <ol>
              <li>개인정보 열람·정정·삭제·처리정지 요구</li>
              <li>서비스 이용 중단 (브라우저에서 본 사이트 데이터 삭제 시 모든 캐시·이용 기록이 즉시 제거됨)</li>
              <li>동의 철회</li>
            </ol>
          </div>

          <div className="section">
            <h2>제6조 (개인정보의 자동 수집 장치 — 쿠키 및 localStorage)</h2>
            <p>회사는 서비스 제공을 위해 다음을 사용합니다.</p>
            <ol>
              <li><strong>localStorage</strong>: 풀이 결과 캐시, 무료 사용 횟수, 19세 이상 인증 여부 등을 저장합니다. 서버로 전송되지 않으며 이용자 브라우저에만 보관됩니다.</li>
              <li><strong>쿠키</strong>: 결제·로그인 기능 도입 시 사용 예정.</li>
            </ol>
            <p>이용자는 브라우저 설정에서 쿠키·로컬 저장소를 거부할 수 있으나, 이 경우 일부 서비스 이용에 제한이 있을 수 있습니다.</p>
          </div>

          <div className="section">
            <h2>제7조 (개인정보 보호책임자)</h2>
            <p>회사는 개인정보 처리에 관한 업무를 총괄하는 개인정보 보호책임자를 지정하고 있습니다. 관련 문의는 운영자 채널을 통해 접수해 주세요.</p>
          </div>

          <div className="section">
            <h2>제8조 (개인정보의 안전성 확보 조치)</h2>
            <ol>
              <li>개인정보 전송 시 HTTPS 암호화 통신 사용</li>
              <li>최소한의 정보만 수집·처리</li>
              <li>개인정보 처리 기록 관리</li>
              <li>접근 권한 최소화 및 통제</li>
            </ol>
          </div>

          <div className="section">
            <h2>제9조 (개인정보 처리방침 변경)</h2>
            <p>이 개인정보 처리방침은 2026년 4월 22일부터 적용되며, 법령·정책 또는 보안 기술의 변경에 따라 내용의 추가·삭제·수정이 있을 시 시행 7일 전 공지합니다.</p>
          </div>

          <div className="legal-nav">
            <Link href="/terms">이용약관</Link>
            <Link href="/refund">환불정책</Link>
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
