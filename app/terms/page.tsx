"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LEGAL_STYLES } from "@/app/lib/legal-styles";

export default function TermsPage() {
  const router = useRouter();
  return (
    <>
      <style>{LEGAL_STYLES}</style>
      <div className="app">
        <header>
          <button className="back" onClick={() => router.back()} aria-label="뒤로">←</button>
          <div>
            <div className="h-title">이용약관</div>
            <div className="h-sub">TERMS OF SERVICE</div>
          </div>
        </header>
        <div className="content">
          <div className="doc-title">이용약관</div>
          <div className="doc-sub">Myeongricheonwol Terms of Service</div>

          <div className="section">
            <h2>제1조 (목적)</h2>
            <p>본 약관은 명리천월(이하 &ldquo;회사&rdquo;)이 제공하는 사주·타로·자미두수·운세 풀이 서비스(이하 &ldquo;서비스&rdquo;) 이용과 관련하여 회사와 이용자의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.</p>
          </div>

          <div className="section">
            <h2>제2조 (용어의 정의)</h2>
            <ol>
              <li>&ldquo;서비스&rdquo;란 회사가 제공하는 명리천월 웹사이트 및 관련 부가 서비스를 의미합니다.</li>
              <li>&ldquo;이용자&rdquo;란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 자를 의미합니다.</li>
              <li>&ldquo;무료 서비스&rdquo;란 별도 결제 없이 이용 가능한 풀이를 말합니다.</li>
              <li>&ldquo;유료 서비스&rdquo;란 별도 결제 후 이용할 수 있는 심층 풀이 및 챕터를 말합니다.</li>
              <li>&ldquo;콘텐츠&rdquo;란 회사가 서비스를 통해 제공하는 모든 풀이 결과, 텍스트, 이미지 등을 말합니다.</li>
            </ol>
          </div>

          <div className="section">
            <h2>제3조 (약관의 효력 및 변경)</h2>
            <ol>
              <li>본 약관은 서비스 화면에 게시함으로써 효력이 발생합니다.</li>
              <li>회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</li>
              <li>약관이 개정되는 경우 시행일 7일 전(이용자에게 불리한 변경의 경우 30일 전)부터 시행일까지 공지합니다.</li>
            </ol>
          </div>

          <div className="section">
            <h2>제4조 (서비스의 제공)</h2>
            <ol>
              <li>회사는 다음과 같은 서비스를 제공합니다.
                <ul>
                  <li>사주(자평명리) 풀이</li>
                  <li>타로 카드 풀이</li>
                  <li>자미두수 명반 풀이</li>
                  <li>꿈 해몽, 오늘의 운세, 토정비결</li>
                  <li>성인 전용 콘텐츠(밀서, 19세 이상)</li>
                  <li>기타 회사가 정하는 서비스</li>
                </ul>
              </li>
              <li>서비스는 연중무휴 24시간 제공함을 원칙으로 하나, 시스템 점검·교체 등 사유로 일시 중단될 수 있습니다.</li>
            </ol>
          </div>

          <div className="section">
            <h2>제5조 (서비스의 변경 및 중단)</h2>
            <p>회사는 운영상·기술상의 필요에 따라 서비스의 전부 또는 일부를 변경하거나 중단할 수 있으며, 이 경우 사전에 공지합니다. 다만, 사전 공지가 불가능한 긴급한 사유가 있는 경우 사후에 공지할 수 있습니다.</p>
          </div>

          <div className="section">
            <h2>제6조 (이용자의 의무)</h2>
            <p>이용자는 다음 행위를 해서는 안 됩니다.</p>
            <ol>
              <li>타인의 정보를 도용하여 서비스를 이용하는 행위</li>
              <li>서비스의 운영을 방해하는 일체의 행위</li>
              <li>회사 또는 제3자의 저작권 등 지적재산권을 침해하는 행위</li>
              <li>풀이 결과를 무단 복제·배포·상업적으로 이용하는 행위</li>
              <li>관련 법령에 위배되는 행위</li>
            </ol>
          </div>

          <div className="section">
            <h2>제7조 (성인 콘텐츠)</h2>
            <p>성인 전용 콘텐츠(밀서)는 만 19세 이상만 이용할 수 있으며, 이용자는 본인의 연령이 만 19세 이상임을 확인 후 이용해야 합니다. 만 19세 미만이 허위로 이용한 경우의 책임은 이용자에게 있습니다.</p>
          </div>

          <div className="section">
            <h2>제8조 (유료 서비스)</h2>
            <ol>
              <li>유료 서비스 이용 요금 및 결제 방법은 서비스 화면에 게시한 바에 따릅니다.</li>
              <li>이용자는 결제 전에 가격, 결제 수단, 환불 정책을 확인할 의무가 있습니다.</li>
              <li>유료 서비스의 환불 정책은 별도 환불 정책에 따릅니다.</li>
            </ol>
          </div>

          <div className="section">
            <h2>제9조 (저작권)</h2>
            <ol>
              <li>회사가 제공하는 서비스의 저작권은 회사에 귀속됩니다.</li>
              <li>이용자에게 제공된 풀이 결과의 개인적·비상업적 이용은 허용되나, 무단 복제·배포·전송·게시·상업적 활용은 금지됩니다.</li>
            </ol>
          </div>

          <div className="section">
            <h2>제10조 (면책 조항)</h2>
            <div className="warn">
              <strong>본 서비스는 엔터테인먼트 및 자기 성찰 목적으로 제공됩니다.</strong><br /><br />
              풀이 결과는 정통 만세력으로 명식을 정밀 계산한 후 AI(Anthropic Claude)가 작성하는 해석으로, 다음 분야의 전문가 자문을 대체하지 않습니다.
            </div>
            <ol>
              <li>의학적 진단 및 치료 (의사 상담 권장)</li>
              <li>법률 자문 (변호사 상담 권장)</li>
              <li>재무·투자 자문 (전문가 상담 권장)</li>
              <li>심리 상담 (정신건강 전문가 상담 권장)</li>
            </ol>
            <p>이용자는 풀이 결과를 참고로만 활용해야 하며, 이를 근거로 한 의사결정의 결과에 대해 회사는 책임을 지지 않습니다.</p>
            <p>회사는 천재지변, 불가항력, 이용자의 귀책 사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.</p>
          </div>

          <div className="section">
            <h2>제11조 (분쟁 해결)</h2>
            <ol>
              <li>회사와 이용자 사이에 발생한 분쟁에 관한 소송은 민사소송법상의 관할법원에 제기합니다.</li>
              <li>준거법은 대한민국 법령으로 합니다.</li>
            </ol>
          </div>

          <div className="section">
            <h2>부칙</h2>
            <p>본 약관은 2026년 4월 22일부터 시행됩니다.</p>
          </div>

          <div className="legal-nav">
            <Link href="/privacy">개인정보처리방침</Link>
            <Link href="/refund">환불정책</Link>
            <Link href="/">홈으로</Link>
          </div>

          <div className="footer-meta">
            명리천월 (命理天月)<br />
            본 약관 관련 문의는 운영자에게 문의해 주세요.
          </div>
        </div>
      </div>
    </>
  );
}
