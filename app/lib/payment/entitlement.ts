import { getSupabaseAdmin } from '../supabase';
import type { Product, Subscription, UserCredits } from './types';

/* 사용자 권한 (entitlement) 조회 + 크레딧 차감.
 * "이 기능 쓸 수 있나?" 의 단일 답을 만들어주는 서버 헬퍼.
 */

export type Entitlement = {
  /** 무제한 구독으로 접근 가능 */
  unlimited: boolean;
  /** 사용 가능한 크레딧 (구독·크레딧팩) */
  credits: number;
  /** 구독 만료일 */
  subscriptionExpiresAt: string | null;
};

/** 점(.)으로 분리된 feature 키에서 베이스 feature 추출.
 * "saju.general" → "saju", "saju" → "saju" */
export function baseFeatureOf(feature: string): string {
  const i = feature.indexOf('.');
  return i === -1 ? feature : feature.slice(0, i);
}

/** 특정 기능에 대한 사용자의 권한을 조회.
 * feature는 "saju" 같은 베이스 또는 "saju.general" 같은 챕터 특정 키.
 * - 구독: unlimited_features 가 베이스 feature 를 포함하면 모든 하위 feature 커버
 * - 크레딧: exact 매치 또는 베이스 매치 (둘 다 있으면 합산)
 */
export async function getEntitlement(userId: string, feature: string): Promise<Entitlement> {
  const sb = getSupabaseAdmin();
  const nowIso = new Date().toISOString();
  const base = baseFeatureOf(feature);

  // 활성 구독 중 베이스 feature 를 포함하는 게 있나
  const { data: subs } = await sb
    .from('subscriptions')
    .select('*, product:products(unlimited_features)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .gt('expires_at', nowIso)
    .order('expires_at', { ascending: false });

  let unlimited = false;
  let subscriptionExpiresAt: string | null = null;
  for (const s of subs || []) {
    const features = (s as { product?: { unlimited_features?: string[] | null } }).product?.unlimited_features || [];
    if (features.includes(base) || features.includes(feature)) {
      unlimited = true;
      subscriptionExpiresAt = (s as Subscription).expires_at;
      break;
    }
  }

  // 크레딧: exact 우선 조회, 그리고 base
  const keys = base === feature ? [feature] : [feature, base];
  const { data: credits } = await sb
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .in('feature', keys);

  const balance = (credits as UserCredits[] | null || [])
    .reduce((sum, c) => sum + (c.balance || 0), 0);

  return { unlimited, credits: balance, subscriptionExpiresAt };
}

/** 사용자가 이 기능을 한 번 사용 가능한지. */
export async function canUseFeature(userId: string, feature: string): Promise<{
  allowed: boolean;
  reason: 'unlimited' | 'credits' | 'none';
  entitlement: Entitlement;
}> {
  const ent = await getEntitlement(userId, feature);
  if (ent.unlimited) return { allowed: true, reason: 'unlimited', entitlement: ent };
  if (ent.credits > 0) return { allowed: true, reason: 'credits', entitlement: ent };
  return { allowed: false, reason: 'none', entitlement: ent };
}

/** 크레딧 1개 소모 (구독이면 차감 안 함). 호출 전 canUseFeature로 확인 권장.
 * exact-match 크레딧 → base feature 크레딧 순으로 우선 차감.
 */
export async function consumeCredit(userId: string, feature: string): Promise<{ consumed: boolean; remaining: number }> {
  const sb = getSupabaseAdmin();
  const base = baseFeatureOf(feature);

  // 구독 우선 — 구독으로 커버되면 차감 안 함
  const ent = await getEntitlement(userId, feature);
  if (ent.unlimited) return { consumed: false, remaining: ent.credits };
  if (ent.credits <= 0) return { consumed: false, remaining: 0 };

  // exact 매치 크레딧이 있으면 먼저 차감, 없으면 base 차감
  const keys = base === feature ? [feature] : [feature, base];
  const { data: rows } = await sb
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .in('feature', keys);

  const list = (rows as UserCredits[] | null || []).filter((r) => r.balance > 0);
  // exact 먼저
  list.sort((a, b) => (a.feature === feature ? -1 : b.feature === feature ? 1 : 0));
  const target = list[0];
  if (!target) return { consumed: false, remaining: 0 };

  const { data, error } = await sb
    .from('user_credits')
    .update({ balance: target.balance - 1, updated_at: new Date().toISOString() })
    .eq('id', target.id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`크레딧 차감 실패: ${error?.message}`);
  }
  // 차감 후 잔액 합계
  const remaining = ent.credits - 1;
  return { consumed: true, remaining };
}

/** 결제 완료 후 활성화 — product type에 따라 subscription 생성 또는 credits 증가. */
export async function activateProduct(args: {
  userId: string;
  product: Product;
  paymentId: string;
}): Promise<{ kind: 'subscription' | 'credit-pack' | 'single'; detail: string }> {
  const sb = getSupabaseAdmin();
  const { userId, product, paymentId } = args;

  if (product.type === 'subscription') {
    const days = product.interval_days || 30;
    const now = new Date();
    // 이미 활성 구독 있으면 expires_at 연장, 없으면 새로 생성
    const { data: existing } = await sb
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', product.id)
      .eq('status', 'active')
      .maybeSingle();

    if (existing) {
      const baseExpiry = new Date((existing as Subscription).expires_at);
      const newExpiry = baseExpiry > now ? baseExpiry : now;
      newExpiry.setDate(newExpiry.getDate() + days);
      await sb
        .from('subscriptions')
        .update({
          expires_at: newExpiry.toISOString(),
          last_payment_id: paymentId,
        })
        .eq('id', (existing as Subscription).id);
      return { kind: 'subscription', detail: `구독 연장: ${newExpiry.toISOString().slice(0, 10)} 까지` };
    } else {
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + days);
      await sb.from('subscriptions').insert({
        user_id: userId,
        product_id: product.id,
        status: 'active',
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        last_payment_id: paymentId,
      });
      return { kind: 'subscription', detail: `구독 시작: ${expiresAt.toISOString().slice(0, 10)} 까지` };
    }
  }

  if (product.type === 'credit-pack') {
    const feature = product.credit_feature;
    const amount = product.credit_amount || 0;
    if (!feature || amount <= 0) {
      throw new Error(`credit-pack 상품 설정 오류: ${product.id}`);
    }
    const { data: existing } = await sb
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .eq('feature', feature)
      .maybeSingle();

    if (existing) {
      await sb
        .from('user_credits')
        .update({
          balance: (existing as UserCredits).balance + amount,
          last_payment_id: paymentId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', (existing as UserCredits).id);
    } else {
      await sb.from('user_credits').insert({
        user_id: userId,
        feature,
        balance: amount,
        last_payment_id: paymentId,
      });
    }
    return { kind: 'credit-pack', detail: `${feature} 크레딧 ${amount}개 충전` };
  }

  // single — 1회 크레딧으로 즉시 추가
  if (product.type === 'single') {
    const feature = product.feature;
    if (!feature) throw new Error(`single 상품에 feature가 없음: ${product.id}`);
    const { data: existing } = await sb
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .eq('feature', feature)
      .maybeSingle();
    if (existing) {
      await sb
        .from('user_credits')
        .update({
          balance: (existing as UserCredits).balance + 1,
          last_payment_id: paymentId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', (existing as UserCredits).id);
    } else {
      await sb.from('user_credits').insert({
        user_id: userId,
        feature,
        balance: 1,
        last_payment_id: paymentId,
      });
    }
    return { kind: 'single', detail: `${feature} 1회 이용권 추가` };
  }

  throw new Error(`알 수 없는 product type: ${product.type}`);
}
