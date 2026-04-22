export type LimitKind = "daily" | "yearly" | "lifetime";

export interface LimitConfig {
  key: string;
  kind: LimitKind;
  max: number;
  label: string;
}

export const LIMITS = {
  today: { key: "limit_today_v2", kind: "daily", max: 1, label: "오늘운세" } as LimitConfig,
  dream: { key: "limit_dream_v2", kind: "daily", max: 3, label: "꿈해몽" } as LimitConfig,
  saju: { key: "limit_saju_thisyear_light_v1", kind: "yearly", max: 1, label: "올해 운세 (간단)" } as LimitConfig,
  jami: { key: "limit_jami_thisyear_light_v1", kind: "yearly", max: 1, label: "자미두수 (간단)" } as LimitConfig,
  milseo: { key: "limit_milseo_charm_light_v1", kind: "yearly", max: 1, label: "밀서 매력 (간단)" } as LimitConfig,
  tojeong: { key: "limit_tojeong_v2", kind: "yearly", max: 1, label: "토정비결" } as LimitConfig,
} as const;

interface StoredUsage {
  period: string;
  count: number;
}

const periodKey = (kind: LimitKind): string => {
  const now = new Date();
  if (kind === "daily") return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  if (kind === "yearly") return String(now.getFullYear());
  return "lifetime";
};

export interface LimitStatus {
  allowed: boolean;
  used: number;
  max: number;
  remaining: number;
  resetText: string;
}

export function checkLimit(cfg: LimitConfig): LimitStatus {
  if (typeof window === "undefined") return { allowed: true, used: 0, max: cfg.max, remaining: cfg.max, resetText: "" };
  const period = periodKey(cfg.kind);
  let used = 0;
  try {
    const raw = localStorage.getItem(cfg.key);
    if (raw) {
      const parsed: StoredUsage = JSON.parse(raw);
      if (parsed.period === period) used = parsed.count;
    }
  } catch {}
  const resetText =
    cfg.kind === "daily" ? "내일 자정에 초기화" :
    cfg.kind === "yearly" ? `${new Date().getFullYear() + 1}년 1월 1일에 초기화` :
    "다시 풀이하려면 결제가 필요합니다";
  return {
    allowed: used < cfg.max,
    used,
    max: cfg.max,
    remaining: Math.max(0, cfg.max - used),
    resetText,
  };
}

export function recordUsage(cfg: LimitConfig) {
  if (typeof window === "undefined") return;
  const period = periodKey(cfg.kind);
  let used = 0;
  try {
    const raw = localStorage.getItem(cfg.key);
    if (raw) {
      const parsed: StoredUsage = JSON.parse(raw);
      if (parsed.period === period) used = parsed.count;
    }
  } catch {}
  const next: StoredUsage = { period, count: used + 1 };
  localStorage.setItem(cfg.key, JSON.stringify(next));
}

const RESULT_VERSION = 2;
export function saveResult(key: string, payload: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`result_${key}_v${RESULT_VERSION}`, JSON.stringify({ savedAt: Date.now(), payload }));
  } catch {}
}

export function loadResult<T = unknown>(key: string): { savedAt: number; payload: T } | null {
  if (typeof window === "undefined") return null;
  try {
    // 옛 버전 캐시는 자동 정리
    localStorage.removeItem(`result_${key}`);
    const raw = localStorage.getItem(`result_${key}_v${RESULT_VERSION}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
