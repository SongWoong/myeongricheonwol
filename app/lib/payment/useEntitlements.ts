"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

/* 사용자의 feature별 권한 요약.
 * - paymentEnabled=false 면 모든 feature를 bypassed=true 로 취급 (개발 모드와 동일)
 * - 로그인 안 한 경우엔 모든 권한 false
 * - 로그인했으면 /api/payment/me 조회 후 feature별로 unlimited / credits 집계
 */
export type FeatureStatus = {
  /** 무제한 구독으로 접근 가능 */
  unlimited: boolean;
  /** 보유한 크레딧(또는 단건 이용권) 개수 */
  credits: number;
  /** 적어도 한 번은 쓸 수 있나 */
  available: boolean;
};

export type Entitlements = {
  /** true면 결제 시스템이 꺼져 있어서 게이트가 통째로 무시됨 (서버와 동일하게 모두 허용) */
  bypassed: boolean;
  loading: boolean;
  loggedIn: boolean;
  byFeature: Record<string, FeatureStatus>;
  refresh: () => void;
};

type MeResponse = {
  paymentEnabled: boolean;
  subscriptions: Array<{
    expires_at: string;
    product?: { unlimited_features?: string[] };
  }>;
  credits: Array<{ feature: string; balance: number }>;
};

function emptyStatus(): FeatureStatus {
  return { unlimited: false, credits: 0, available: false };
}

export function useEntitlements(): Entitlements {
  const { data: session, status } = useSession();
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch("/api/payment/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [status, tick]);

  const paymentEnabled = data?.paymentEnabled ?? true;
  const bypassed = data ? !data.paymentEnabled : false;

  const byFeature: Record<string, FeatureStatus> = {};
  if (data) {
    for (const sub of data.subscriptions || []) {
      const feats = sub.product?.unlimited_features || [];
      for (const f of feats) {
        if (!byFeature[f]) byFeature[f] = emptyStatus();
        byFeature[f].unlimited = true;
        byFeature[f].available = true;
      }
    }
    for (const c of data.credits || []) {
      if (!byFeature[c.feature]) byFeature[c.feature] = emptyStatus();
      byFeature[c.feature].credits = c.balance;
      if (c.balance > 0) byFeature[c.feature].available = true;
    }
  }

  return {
    bypassed,
    loading: status === "loading" || loading,
    loggedIn: !!session?.user,
    byFeature,
    refresh: () => setTick((t) => t + 1),
    // paymentEnabled를 외부에서 직접 보고 싶을 때를 위해 (필요하면 유지)
    ...(paymentEnabled ? {} : {}),
  };
}

/** 특정 feature에 대해 "지금 한 번 풀이를 호출해도 되는가?"
 * "saju.general" 같은 챕터 키로 물으면 챕터 exact 매치 + 베이스("saju") 둘 다 검사.
 */
export function canUnlock(ents: Entitlements, feature: string): boolean {
  if (ents.bypassed) return true; // 결제 시스템 꺼짐 → 통과
  const base = feature.includes(".") ? feature.split(".")[0] : feature;
  const exact = ents.byFeature[feature];
  const baseS = ents.byFeature[base];
  if (exact?.available) return true;
  if (baseS?.available) return true;
  return false;
}

/** 특정 챕터에 대한 잠금 상태/뱃지용 정보 요약 */
export function chapterStatus(ents: Entitlements, baseFeature: string, chapterId: string): {
  unlocked: boolean;
  reason: 'bypass' | 'unlimited' | 'chapter-credit' | 'pack-credit' | 'locked';
  remaining: number; // 챕터별 또는 베이스 잔여 (합산)
} {
  if (ents.bypassed) return { unlocked: true, reason: 'bypass', remaining: 0 };
  const exactKey = `${baseFeature}.${chapterId}`;
  const baseS = ents.byFeature[baseFeature];
  const exact = ents.byFeature[exactKey];
  if (baseS?.unlimited) return { unlocked: true, reason: 'unlimited', remaining: 0 };
  if ((exact?.credits || 0) > 0) {
    return { unlocked: true, reason: 'chapter-credit', remaining: exact!.credits };
  }
  if ((baseS?.credits || 0) > 0) {
    return { unlocked: true, reason: 'pack-credit', remaining: baseS!.credits };
  }
  return { unlocked: false, reason: 'locked', remaining: 0 };
}
