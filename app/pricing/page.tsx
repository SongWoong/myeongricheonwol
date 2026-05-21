import Link from 'next/link';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/app/lib/supabase';
import { isPaymentEnabled, getPaymentMode } from '@/app/lib/payment/types';
import type { Product } from '@/app/lib/payment/types';
import { BusinessInfo } from '@/app/components/BusinessInfo';

export const metadata = {
  title: '결제 — 명리천월',
};

async function fetchActiveProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const sb = getSupabaseAdmin();
    const { data } = await sb
      .from('products')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    return (data as Product[]) || [];
  } catch {
    return [];
  }
}

function fmtPrice(n: number): string {
  return n.toLocaleString('ko-KR') + '원';
}

function typeBadge(t: Product['type']): { label: string; color: string } {
  if (t === 'single') return { label: '단건', color: '#9b8260' };
  if (t === 'subscription') return { label: '구독', color: '#7a5aa3' };
  return { label: '크레딧 팩', color: '#5a8a7a' };
}

export default async function PricingPage() {
  const enabled = isPaymentEnabled();
  const mode = getPaymentMode();
  const products = enabled ? await fetchActiveProducts() : [];

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0716 0%, #060410 100%)',
      color: '#e8e4d5',
      padding: '60px 20px',
      fontFamily: '"Noto Serif KR", "Apple SD Gothic Neo", serif',
    }}>
      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        <Link href="/" style={{ color: '#9b8260', fontSize: 14, textDecoration: 'none' }}>← 홈으로</Link>
        <h1 style={{
          marginTop: 12,
          fontSize: 'clamp(28px, 5vw, 42px)',
          fontWeight: 500,
          letterSpacing: '-0.02em',
        }}>
          이용 안내
        </h1>
        <p style={{ marginTop: 12, color: '#9a9590', fontSize: 15, lineHeight: 1.7 }}>
          단건으로 한 번만 풀이를 받거나, 구독으로 자유롭게 이용하실 수 있습니다.
        </p>

        {!enabled && (
          <div style={{
            marginTop: 32,
            padding: '20px 24px',
            background: 'rgba(255, 200, 100, 0.1)',
            border: '1px solid rgba(255, 200, 100, 0.3)',
            borderRadius: 8,
            color: '#d4b87a',
            fontSize: 14,
            lineHeight: 1.7,
          }}>
            <strong>결제 시스템 비활성 (PAYMENT_MODE={mode})</strong>
            <p style={{ marginTop: 8, color: '#a59570' }}>
              .env.local에 <code>TOSS_SECRET_KEY</code>와 <code>NEXT_PUBLIC_TOSS_CLIENT_KEY</code>를 설정하고
              <code>PAYMENT_MODE=test</code> 또는 <code>live</code>로 바꾸면 결제가 활성화됩니다.
              Supabase 키도 함께 필요합니다.
            </p>
          </div>
        )}

        {enabled && products.length === 0 && (
          <div style={{
            marginTop: 32,
            padding: '40px 20px',
            textAlign: 'center',
            color: '#9a9590',
            border: '1px dashed #2a2235',
            borderRadius: 8,
          }}>
            등록된 상품이 없습니다. Supabase products 테이블을 확인하세요.
          </div>
        )}

        <div style={{
          marginTop: 40,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 20,
        }}>
          {products.map((p) => {
            const badge = typeBadge(p.type);
            return (
              <div key={p.id} style={{
                padding: 24,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}>
                <span style={{
                  alignSelf: 'flex-start',
                  fontSize: 11,
                  padding: '3px 10px',
                  background: badge.color + '22',
                  color: badge.color,
                  borderRadius: 12,
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                }}>
                  {badge.label}
                </span>
                <h2 style={{ fontSize: 20, fontWeight: 500, color: '#f4ecd9' }}>{p.name}</h2>
                <p style={{ fontSize: 13, color: '#9a9590', lineHeight: 1.6, minHeight: 42 }}>
                  {p.description}
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 8,
                  marginTop: 'auto',
                }}>
                  <span style={{ fontSize: 26, fontWeight: 600, color: '#e8d6a8' }}>
                    {fmtPrice(p.price)}
                  </span>
                  {p.type === 'subscription' && p.interval_days && (
                    <span style={{ color: '#9a9590', fontSize: 13 }}>
                      / {p.interval_days >= 365 ? '년' : `${p.interval_days}일`}
                    </span>
                  )}
                </div>
                <Link
                  href={`/checkout/${p.id}`}
                  style={{
                    marginTop: 8,
                    display: 'block',
                    padding: '12px 20px',
                    background: '#9b8260',
                    color: '#0a0716',
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    borderRadius: 6,
                    textAlign: 'center',
                  }}
                >
                  결제하기
                </Link>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 60, fontSize: 12, color: '#6a6560', lineHeight: 1.7 }}>
          <p>• 결제는 토스페이먼츠를 통해 안전하게 처리됩니다.</p>
          <p>• 환불·취소는 <Link href="/refund" style={{ color: '#9b8260' }}>환불 정책</Link>에 따라 처리됩니다.</p>
          <p>• 구독은 만료 전 자동 갱신되지 않습니다 (1회 결제). 만료 후 다시 결제하시면 됩니다.</p>
        </div>
        <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <BusinessInfo />
        </div>
      </div>
    </main>
  );
}
