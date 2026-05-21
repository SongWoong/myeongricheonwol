'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type ConfirmResult = {
  ok: boolean;
  alreadyConfirmed?: boolean;
  status: string;
  activation?: { kind: string; detail: string } | null;
  payment?: { product_id: string; amount: number };
  error?: string;
};

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessInner />
    </Suspense>
  );
}

function CheckoutSuccessInner() {
  const params = useSearchParams();
  const [result, setResult] = useState<ConfirmResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const paymentKey = params.get('paymentKey');
    const orderId = params.get('orderId');
    const amount = Number(params.get('amount'));

    if (!paymentKey || !orderId || !amount) {
      setError('필수 파라미터 누락');
      setLoading(false);
      return;
    }

    fetch('/api/payment/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setResult(d);
      })
      .catch((e) => setError(e instanceof Error ? e.message : '승인 실패'))
      .finally(() => setLoading(false));
  }, [params]);

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0716 0%, #060410 100%)',
      color: '#e8e4d5',
      padding: '60px 20px',
      fontFamily: '"Noto Serif KR", "Apple SD Gothic Neo", serif',
      display: 'grid',
      placeItems: 'center',
    }}>
      <div style={{
        maxWidth: 500,
        width: '100%',
        padding: 32,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        textAlign: 'center',
      }}>
        {loading && (
          <>
            <div style={{ fontSize: 32, marginBottom: 16 }}>⏳</div>
            <h1 style={{ fontSize: 20, color: '#f4ecd9' }}>결제를 승인하고 있습니다...</h1>
            <p style={{ marginTop: 8, color: '#9a9590', fontSize: 14 }}>
              잠시만 기다려주세요. 페이지를 닫지 마세요.
            </p>
          </>
        )}

        {error && (
          <>
            <div style={{ fontSize: 32, marginBottom: 16 }}>⚠</div>
            <h1 style={{ fontSize: 20, color: '#ffa0a0' }}>결제 승인 실패</h1>
            <p style={{ marginTop: 12, color: '#9a9590', fontSize: 14, lineHeight: 1.7 }}>
              {error}
            </p>
            <Link
              href="/pricing"
              style={{
                marginTop: 24,
                display: 'inline-block',
                padding: '12px 24px',
                background: '#9b8260',
                color: '#0a0716',
                borderRadius: 6,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              이용 안내로 돌아가기
            </Link>
          </>
        )}

        {result && !error && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
            <h1 style={{ fontSize: 22, color: '#f4ecd9', fontWeight: 500 }}>
              {result.alreadyConfirmed ? '이미 처리된 결제입니다' : '결제가 완료되었습니다'}
            </h1>
            {result.activation && (
              <p style={{ marginTop: 16, color: '#e8d6a8', fontSize: 15, lineHeight: 1.7 }}>
                {result.activation.detail}
              </p>
            )}
            <div style={{
              marginTop: 28,
              display: 'flex',
              gap: 10,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              <Link
                href="/"
                style={{
                  padding: '12px 24px',
                  background: '#9b8260',
                  color: '#0a0716',
                  borderRadius: 6,
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                홈으로
              </Link>
              <Link
                href="/account/billing"
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  color: '#9b8260',
                  border: '1px solid #9b8260',
                  borderRadius: 6,
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                결제 내역
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
