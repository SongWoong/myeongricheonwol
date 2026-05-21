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

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const productId = params?.productId as string;

  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      router.replace(`/login?callbackUrl=/checkout/${productId}`);
      return;
    }
    setLoading(true);
    setError('');
    fetch('/api/payment/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
        } else {
          setCheckout(d as Checkout);
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : '주문 생성 실패'))
      .finally(() => setLoading(false));
  }, [status, session, productId, router]);

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
        <Link href="/pricing" style={{ color: '#9b8260', fontSize: 14, textDecoration: 'none' }}>← 이용 안내로</Link>
        <h1 style={{ marginTop: 12, fontSize: 30, fontWeight: 500, letterSpacing: '-0.02em' }}>
          결제
        </h1>

        {status === 'loading' && <p style={{ marginTop: 24, color: '#9a9590' }}>로그인 정보 확인 중...</p>}

        {error && (
          <div style={{
            marginTop: 24,
            padding: '16px 20px',
            background: 'rgba(255,100,100,0.1)',
            border: '1px solid rgba(255,100,100,0.3)',
            borderRadius: 8,
            color: '#ffa0a0',
            fontSize: 14,
          }}>
            {error}
          </div>
        )}

        {checkout && !error && (
          <div style={{
            marginTop: 32,
            padding: 24,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
          }}>
            <h2 style={{ fontSize: 18, color: '#f4ecd9', marginBottom: 16 }}>
              주문 내역
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 16px', fontSize: 14 }}>
              <span style={{ color: '#9a9590' }}>상품</span>
              <span style={{ color: '#e8e4d5' }}>{checkout.orderName}</span>
              <span style={{ color: '#9a9590' }}>주문번호</span>
              <span style={{ color: '#9a9590', fontFamily: 'monospace', fontSize: 12 }}>{checkout.orderId}</span>
              <span style={{ color: '#9a9590' }}>금액</span>
              <span style={{ color: '#e8d6a8', fontSize: 20, fontWeight: 600 }}>
                {checkout.amount.toLocaleString('ko-KR')}원
              </span>
            </div>

            <button
              onClick={proceed}
              disabled={loading}
              style={{
                marginTop: 24,
                width: '100%',
                padding: '14px 20px',
                background: '#9b8260',
                color: '#0a0716',
                border: 'none',
                borderRadius: 6,
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? '진행 중...' : '카드로 결제하기'}
            </button>

            <p style={{ marginTop: 14, fontSize: 12, color: '#6a6560', lineHeight: 1.7 }}>
              결제는 토스페이먼츠 보안 페이지에서 진행됩니다.<br />
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
