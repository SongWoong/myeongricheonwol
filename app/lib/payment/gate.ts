import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { canUseFeature, consumeCredit } from './entitlement';
import { isPaymentEnabled } from './types';
import { isSupabaseConfigured } from '../supabase';

/* 유료 챕터(또는 기능) 호출 전 권한 게이트.
 * - 결제 시스템 비활성/Supabase 미설정 → 게이트 비활성 (개발 모드 폴백)
 * - 비로그인 → 401 (loginRequired)
 * - 권한 없음 → 402 (paymentRequired)
 * - 권한 있음 → onSuccess 콜백에서 consume() 호출하여 크레딧 차감
 */
export type GateResult =
  | { ok: true; userId: string; consume: () => Promise<void>; bypassed?: boolean }
  | { ok: false; response: NextResponse };

export async function gateFeature(feature: string): Promise<GateResult> {
  // 결제 시스템 미구성 환경에선 통과 (로컬 개발 등)
  if (!isPaymentEnabled() || !isSupabaseConfigured()) {
    return {
      ok: true,
      userId: 'guest',
      bypassed: true,
      consume: async () => {},
    };
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: '로그인이 필요합니다.', loginRequired: true, redirectTo: '/login' },
        { status: 401 },
      ),
    };
  }

  const userId = session.user.id;
  const check = await canUseFeature(userId, feature);
  if (!check.allowed) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: '이용권이 필요합니다.',
          paymentRequired: true,
          feature,
          redirectTo: '/pricing',
        },
        { status: 402 },
      ),
    };
  }

  return {
    ok: true,
    userId,
    consume: async () => {
      if (check.reason === 'credits') {
        await consumeCredit(userId, feature);
      }
    },
  };
}
