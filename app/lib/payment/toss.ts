/* 토스페이먼츠 서버 API 호출 헬퍼.
 * 결제 승인·취소·조회는 서버에서 Secret Key 로 호출.
 */

const TOSS_API_BASE = 'https://api.tosspayments.com/v1';

function getSecretKey(): string {
  const key = process.env.TOSS_SECRET_KEY;
  if (!key) throw new Error('TOSS_SECRET_KEY가 설정되지 않았습니다.');
  return key;
}

function authHeader(): string {
  const key = getSecretKey();
  // Basic Auth: Base64(secretKey:)
  return 'Basic ' + Buffer.from(`${key}:`).toString('base64');
}

export type TossPaymentResponse = {
  paymentKey: string;
  orderId: string;
  status: string;
  totalAmount: number;
  method: string;
  approvedAt?: string;
  receipt?: { url?: string };
  card?: { number?: string; company?: string };
  failure?: { code: string; message: string };
  [k: string]: unknown;
};

/** 결제 승인 — 사용자가 토스에서 결제 완료 후 redirect 받았을 때 호출. */
export async function confirmTossPayment(args: {
  paymentKey: string;
  orderId: string;
  amount: number;
}): Promise<TossPaymentResponse> {
  const res = await fetch(`${TOSS_API_BASE}/payments/confirm`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = data as { code?: string; message?: string };
    throw new Error(`Toss confirm 실패 (${err.code || res.status}): ${err.message || ''}`);
  }
  return data as TossPaymentResponse;
}

/** 결제 조회 — paymentKey 또는 orderId 로. */
export async function fetchTossPayment(paymentKey: string): Promise<TossPaymentResponse> {
  const res = await fetch(`${TOSS_API_BASE}/payments/${encodeURIComponent(paymentKey)}`, {
    headers: { Authorization: authHeader() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Toss 조회 실패: ${JSON.stringify(data)}`);
  return data as TossPaymentResponse;
}

/** 결제 취소 (전체·부분). */
export async function cancelTossPayment(args: {
  paymentKey: string;
  cancelReason: string;
  cancelAmount?: number;
}): Promise<TossPaymentResponse> {
  const res = await fetch(`${TOSS_API_BASE}/payments/${encodeURIComponent(args.paymentKey)}/cancel`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cancelReason: args.cancelReason,
      ...(args.cancelAmount !== undefined ? { cancelAmount: args.cancelAmount } : {}),
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Toss 취소 실패: ${JSON.stringify(data)}`);
  return data as TossPaymentResponse;
}

/** Toss 상태 문자열을 우리 DB enum 으로 매핑. */
export function tossStatusToInternal(tossStatus: string): 'pending' | 'in_progress' | 'done' | 'canceled' | 'partial_canceled' | 'failed' | 'aborted' {
  const s = tossStatus.toUpperCase();
  if (s === 'READY' || s === 'WAITING_FOR_DEPOSIT') return 'pending';
  if (s === 'IN_PROGRESS') return 'in_progress';
  if (s === 'DONE') return 'done';
  if (s === 'CANCELED') return 'canceled';
  if (s === 'PARTIAL_CANCELED') return 'partial_canceled';
  if (s === 'EXPIRED') return 'failed';
  if (s === 'ABORTED') return 'aborted';
  return 'failed';
}

/** 주문번호 생성 — 토스에 전달할 unique ID. */
export function generateOrderId(): string {
  // 토스 권장 64자 이하, 영숫자·하이픈
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `order_${ts}_${rand}`;
}
