'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { BusinessInfo } from '@/app/components/BusinessInfo';

type Checkout = {
  orderId: string;
  orderName: string;
  amount: number;
  currency: string;
  productId: string;
  clientKey: string;
  successUrl: string;
  failUrl: string;
  customerEmail: string | null;
  customerName: string | null;
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 6,
  color: '#e8e4d5',
  fontSize: 14,
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
};

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const productId = params?.productId as string;

  // 비회원 입력
  const [guestName, setGuestName]   = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const isLoggedIn = status !== 'loading' && !!session?.user;
  const isGuest    = status !== 'loading' && !session?.user;

  // 로그인 사용자는 자동으로 주문 생성
  useEffect(() => {
    if (status === 'loading') return;
    if (!isLoggedIn) return; // 비회원은 폼 제출 후 생성
    createOrder();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, isLoggedIn]);

  const createOrder = async (overrideBody?: { guestName: string; guestEmail: string }) => {
    setLoading(true);
    setError('');
    try {
      const body: Record<string, string> = { productId };
      if (overrideBody) {
        body.guestName  = overrideBody.guestName;
        body.guestEmail = overrideBody.guestEmail;
      }
      const r = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (d.error) {
        setError(d.error);
      } else {
        setCheckout(d as Checkout);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '주문 생성 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestEmail.trim()) {
      setError('이름과 이메일을 입력해주세요.');
      return;
    }
    createOrder({ guestName: guestName.trim(), guestEmail: guestEmail.trim() });
  };

  const proceed = async () => {
    if (!checkout) return;
    setLoading(true);
    setError('');
    try {
      const toss = await loadTossPayments(checkout.clientKey);
      await toss.requestPayment('카드', {
        amount: checkout.amount,
        orderId: checkout.orderId,
        orderName: checkout.orderName,
        successUrl: checkout.successUrl,
        failUrl: checkout.failUrl,
        customerEmail: checkout.customerEmail || undefined,
        customerName: checkout.customerName || undefined,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : '결제 위젯 로드 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0716 0%, #060410 100%)',
      color: '#e8e4d5',
      padding: '60px 20px',
      fontFamily: '"Noto Serif KR", "Apple SD Gothic Neo", serif',
    }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <Link href="/pricing" style={{ color: '#9b8260', fontSize: 14, textDecoration: 'none' }}>
          ← 이용 안내로
        </Link>
        <h1 style={{ marginTop: 12, fontSize: 30, fontWeight: 500, letterSpacing: '-0.02em' }}>
          결제
        </h1>

        {status === 'loading' && (
          <p style={{ marginTop: 24, color: '#9a9590' }}>로그인 정보 확인 중...</p>
        )}

        {error && (
          <div style={{
            marginTop: 24, padding: '16px 20px',
            background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)',
            borderRadius: 8, color: '#ffa0a0', fontSize: 14,
          }}>
            {error}
          </div>
        )}

        {/* 비회원 — 이름/이메일 폼 */}
        {isGuest && !checkout && !loading && (
          <div style={{ marginTop: 32 }}>
            {/* 로그인 유도 (선택) */}
            <div style={{
              padding: '16px 20px', marginBottom: 20,
              background: 'rgba(155,130,96,0.1)', border: '1px solid rgba(155,130,96,0.3)',
              borderRadius: 8, fontSize: 13, color: '#c8a870', lineHeight: 1.7,
            }}>
              <strong>로그인하면 결제 내역을 확인하고 이용권을 자동 적용할 수 있어요.</strong><br/>
              <span
                style={{ textDecoration: 'underline', cursor: 'pointer' }}
                onClick={() => router.push(`/login?callbackUrl=/checkout/${productId}`)}
              >
                카카오·구글 로그인하기 →
              </span>
            </div>

            {/* 비회원 결제 폼 */}
            <form onSubmit={handleGuestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h2 style={{ fontSize: 16, color: '#f4ecd9', marginBottom: 4 }}>비회원으로 결제하기</h2>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#9a9590', marginBottom: 6, letterSpacing: 1 }}>
                  이름
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="홍길동"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#9a9590', marginBottom: 6, letterSpacing: 1 }}>
                  이메일 (영수증 발송)
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  style={inputStyle}
                />
              </div>
              <button
                type="submit"
                style={{
                  marginTop: 6, padding: '13px 20px',
                  background: '#9b8260', color: '#0a0716',
                  border: 'none', borderRadius: 6,
                  fontSize: 15, fontWeight: 600, cursor: 'pointer',
                }}
              >
                다음 — 결제 정보 확인
              </button>
            </form>
          </div>
        )}

        {/* 로그인 중 로딩 */}
        {loading && !checkout && (
          <p style={{ marginTop: 32, color: '#9a9590' }}>주문 정보를 불러오는 중...</p>
        )}

        {/* 주문 확인 + 결제 버튼 */}
        {checkout && !error && (
          <div style={{
            marginTop: 32, padding: 24,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
          }}>
            <h2 style={{ fontSize: 18, color: '#f4ecd9', marginBottom: 16 }}>주문 내역</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 16px', fontSize: 14 }}>
              <span style={{ color: '#9a9590' }}>상품</span>
              <span style={{ color: '#e8e4d5' }}>{checkout.orderName}</span>
              <span style={{ color: '#9a9590' }}>주문번호</span>
              <span style={{ color: '#9a9590', fontFamily: 'monospace', fontSize: 12 }}>{checkout.orderId}</span>
              <span style={{ color: '#9a9590' }}>구매자</span>
              <span style={{ color: '#e8e4d5' }}>{checkout.customerName} ({checkout.customerEmail})</span>
              <span style={{ color: '#9a9590' }}>금액</span>
              <span style={{ color: '#e8d6a8', fontSize: 20, fontWeight: 600 }}>
                {checkout.amount.toLocaleString('ko-KR')}원
              </span>
            </div>

            <button
              onClick={proceed}
              disabled={loading}
              style={{
                marginTop: 24, width: '100%',
                padding: '14px 20px',
                background: '#9b8260', color: '#0a0716',
                border: 'none', borderRadius: 6,
                fontSize: 15, fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? '진행 중...' : '신용카드로 결제하기'}
            </button>

            {/* 결제 수단 안내 */}
            <div style={{
              marginTop: 14, padding: '10px 14px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 6, fontSize: 12, color: '#9a9590',
            }}>
              💳 신용카드 · 체크카드 결제 가능<br/>
              토스페이먼츠 보안 결제 시스템을 통해 안전하게 처리됩니다.
            </div>

            <p style={{ marginTop: 10, fontSize: 12, color: '#6a6560', lineHeight: 1.7 }}>
              결제 후 자동으로 돌아오며, 이용권은 즉시 활성화됩니다.
            </p>
          </div>
        )}

        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <BusinessInfo />
        </div>
      </div>
    </main>
  );
}
