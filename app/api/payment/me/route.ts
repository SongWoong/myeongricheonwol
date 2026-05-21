import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/app/lib/supabase';
import { isPaymentEnabled } from '@/app/lib/payment/types';

/* GET /api/payment/me
 * 내 활성 구독·크레딧·최근 결제 내역.
 */
export async function GET(_request: NextRequest) {
  try {
    // 결제 비활성 상태에선 로그인 여부와 무관하게 비활성 신호를 돌려줌
    // (프론트의 useEntitlements가 bypassed=true 로 해석해서 게이트를 우회)
    if (!isPaymentEnabled() || !isSupabaseConfigured()) {
      return NextResponse.json({
        paymentEnabled: false,
        subscriptions: [],
        credits: [],
        recentPayments: [],
      });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const sb = getSupabaseAdmin();
    const userId = session.user.id;
    const nowIso = new Date().toISOString();

    const [subRes, creditRes, payRes] = await Promise.all([
      sb
        .from('subscriptions')
        .select('*, product:products(name, unlimited_features)')
        .eq('user_id', userId)
        .gte('expires_at', nowIso)
        .order('expires_at', { ascending: false }),
      sb.from('user_credits').select('*').eq('user_id', userId),
      sb
        .from('payments')
        .select('*, product:products(name)')
        .eq('user_id', userId)
        .order('requested_at', { ascending: false })
        .limit(20),
    ]);

    return NextResponse.json({
      paymentEnabled: true,
      subscriptions: subRes.data || [],
      credits: creditRes.data || [],
      recentPayments: payRes.data || [],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : '알 수 없는 오류';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
