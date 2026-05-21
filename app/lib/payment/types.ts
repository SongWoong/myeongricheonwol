export type ProductType = 'single' | 'subscription' | 'credit-pack';

export type PaymentStatus =
  | 'pending'
  | 'in_progress'
  | 'done'
  | 'canceled'
  | 'partial_canceled'
  | 'failed'
  | 'aborted';

export type Product = {
  id: string;
  type: ProductType;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  feature: string | null;
  interval_days: number | null;
  unlimited_features: string[] | null;
  credit_feature: string | null;
  credit_amount: number | null;
  active: boolean;
  sort_order: number;
};

export type Payment = {
  id: string;
  user_id: string;
  user_email: string | null;
  product_id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  toss_payment_key: string | null;
  toss_method: string | null;
  failure_code: string | null;
  failure_message: string | null;
  requested_at: string;
  paid_at: string | null;
  canceled_at: string | null;
};

export type Subscription = {
  id: string;
  user_id: string;
  product_id: string;
  status: 'active' | 'canceled' | 'expired';
  started_at: string;
  expires_at: string;
  last_payment_id: string | null;
  canceled_at: string | null;
};

export type UserCredits = {
  id: string;
  user_id: string;
  feature: string;
  balance: number;
  expires_at: string | null;
  last_payment_id: string | null;
  updated_at: string;
};

export type PaymentMode = 'disabled' | 'test' | 'live';

export function getPaymentMode(): PaymentMode {
  const m = (process.env.PAYMENT_MODE || '').toLowerCase();
  const hasKeys = !!(process.env.TOSS_SECRET_KEY && process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY);
  if (m === 'test' || m === 'live') {
    // 모드는 지정됐지만 토스 키가 비어 있으면 비활성으로 간주 (호출 시 빈 키로 실패하는 것 방지)
    return hasKeys ? m : 'disabled';
  }
  if (hasKeys) return 'test';
  return 'disabled';
}

export function isPaymentEnabled(): boolean {
  return getPaymentMode() !== 'disabled';
}
