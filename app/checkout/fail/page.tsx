'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function CheckoutFailPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutFailInner />
    </Suspense>
  );
}

function CheckoutFailInner() {
  const params = useSearchParams();
  const code = params.get('code') || '';
  const message = params.get('message') || '결제가 완료되지 않았습니다.';

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
        maxWidth: 480,
        width: '100%',
        padding: 32,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>×</div>
        <h1 style={{ fontSize: 20, color: '#ffa0a0', fontWeight: 500 }}>결제 실패</h1>
        <p style={{ marginTop: 12, color: '#9a9590', fontSize: 14, lineHeight: 1.7 }}>
          {message}
        </p>
        {code && (
          <p style={{ marginTop: 8, color: '#6a6560', fontSize: 12, fontFamily: 'monospace' }}>
            오류 코드: {code}
          </p>
        )}
        <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/pricing"
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
            다시 시도
          </Link>
          <Link
            href="/"
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
            홈으로
          </Link>
        </div>
      </div>
    </main>
  );
}
