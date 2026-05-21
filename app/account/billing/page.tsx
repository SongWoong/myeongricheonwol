'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

type MeResponse = {
  paymentEnabled: boolean;
  subscriptions: Array<{
    id: string;
    product_id: string;
    status: string;
    started_at: string;
    expires_at: string;
    product?: { name?: string; unlimited_features?: string[] };
  }>;
  credits: Array<{ feature: string; balance: number; expires_at: string | null }>;
  recentPayments: Array<{
    id: string;
    order_id: string;
    product_id: string;
    amount: number;
    status: string;
    requested_at: string;
    paid_at: string | null;
    product?: { name?: string };
  }>;
};

function fmtDate(s: string | null): string {
  if (!s) return '-';
  const d = new Date(s);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function statusLabel(s: string): string {
  return {
    pending: '대기',
    in_progress: '진행 중',
    done: '완료',
    canceled: '취소',
    partial_canceled: '부분 취소',
    failed: '실패',
    aborted: '중단',
  }[s] || s;
}

export default function BillingPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setLoading(false);
      return;
    }
    if (status === 'authenticated') {
      fetch('/api/payment/me')
        .then((r) => r.json())
        .then((d) => setData(d))
        .finally(() => setLoading(false));
    }
  }, [status]);

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0716 0%, #060410 100%)',
      color: '#e8e4d5',
      padding: '60px 20px',
      fontFamily: '"Noto Serif KR", "Apple SD Gothic Neo", serif',
    }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <Link href="/" style={{ color: '#9b8260', fontSize: 14, textDecoration: 'none' }}>← 홈으로</Link>
        <h1 style={{ marginTop: 12, fontSize: 30, fontWeight: 500, letterSpacing: '-0.02em' }}>
          내 결제 내역
        </h1>

        {status === 'unauthenticated' && (
          <p style={{ marginTop: 24, color: '#9a9590' }}>
            <Link href="/login" style={{ color: '#9b8260' }}>로그인</Link>이 필요합니다.
          </p>
        )}

        {loading && status === 'authenticated' && (
          <p style={{ marginTop: 24, color: '#9a9590' }}>불러오는 중...</p>
        )}

        {data && (
          <>
            <Section title="활성 구독">
              {data.subscriptions.length === 0 ? (
                <Empty msg="활성 구독이 없습니다." cta="구독 알아보기" href="/pricing" />
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
                  {data.subscriptions.map((s) => (
                    <li key={s.id} style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <strong style={{ fontSize: 16, color: '#f4ecd9' }}>{s.product?.name || s.product_id}</strong>
                        <span style={{ fontSize: 12, color: '#9b8260' }}>
                          ~ {fmtDate(s.expires_at)}
                        </span>
                      </div>
                      <p style={{ marginTop: 6, fontSize: 13, color: '#9a9590' }}>
                        포함 기능: {(s.product?.unlimited_features || []).join(', ') || '-'}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section title="크레딧 잔액">
              {data.credits.length === 0 ? (
                <Empty msg="보유 크레딧이 없습니다." cta="크레딧 충전" href="/pricing" />
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
                  {data.credits.map((c) => (
                    <li key={c.feature} style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <strong style={{ fontSize: 16, color: '#f4ecd9' }}>{c.feature}</strong>
                        <span style={{ fontSize: 18, color: '#e8d6a8', fontWeight: 600 }}>
                          {c.balance}개 남음
                        </span>
                      </div>
                      {c.expires_at && (
                        <p style={{ marginTop: 6, fontSize: 12, color: '#9a9590' }}>
                          {fmtDate(c.expires_at)} 만료
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section title="최근 결제">
              {data.recentPayments.length === 0 ? (
                <Empty msg="결제 이력이 없습니다." />
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
                  {data.recentPayments.map((p) => (
                    <li key={p.id} style={{ ...cardStyle, padding: '14px 18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div>
                          <strong style={{ fontSize: 14, color: '#e8e4d5' }}>
                            {p.product?.name || p.product_id}
                          </strong>
                          <p style={{ fontSize: 11, color: '#6a6560', marginTop: 2 }}>
                            {fmtDate(p.paid_at || p.requested_at)} · {statusLabel(p.status)}
                          </p>
                        </div>
                        <span style={{ fontSize: 14, color: '#e8d6a8', fontWeight: 600 }}>
                          {p.amount.toLocaleString('ko-KR')}원
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </>
        )}
      </div>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  padding: '16px 20px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 40 }}>
      <h2 style={{ fontSize: 13, color: '#9a9590', letterSpacing: '0.06em', marginBottom: 14, fontWeight: 500 }}>
        {title.toUpperCase()}
      </h2>
      {children}
    </section>
  );
}

function Empty({ msg, cta, href }: { msg: string; cta?: string; href?: string }) {
  return (
    <div style={{ padding: '20px 16px', textAlign: 'center', color: '#6a6560', fontSize: 13, border: '1px dashed #2a2235', borderRadius: 8 }}>
      <p>{msg}</p>
      {cta && href && (
        <Link href={href} style={{ marginTop: 10, color: '#9b8260', fontSize: 13, display: 'inline-block', textDecoration: 'none' }}>
          {cta} →
        </Link>
      )}
    </div>
  );
}
