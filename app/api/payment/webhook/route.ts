import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/app/lib/supabase';
import { tossStatusToInternal } from '@/app/lib/payment/toss';
import type { Payment } from '@/app/lib/payment/types';

/* POST /api/payment/webhook
 * 토스에서 결제 상태 변경 시 호출하는 webhook.
 * 토스 콘솔 → 웹훅 → 이 URL 등록.
 * 결제 취소·환불·실패 등을 DB에 동기화.
 *
 * 인증: 토스는 IP 화이트리스트 또는 webhook secret 으로 검증할 수 있다.
 * 여기서는 TOSS_WEBHOOK_SECRET 환경변수가 있으면 header 검증.
 */

type TossWebhookBody = {
  eventType: string; // PAYMENT_STATUS_CHANGED, ...
  createdAt: string;
  data: {
    paymentKey: string;
    orderId: string;
    status: string;
    [k: string]: unknown;
  };
};

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Supabase 설정 필요' }, { status: 503 });
    }

    // (선택) Webhook secret 검증
    const secret = process.env.TOSS_WEBHOOK_SECRET;
    if (secret) {
      const got = request.headers.get('x-toss-webhook-signature') || request.headers.get('toss-webhook-signature');
      if (got !== secret) {
        return NextResponse.json({ error: '잘못된 webhook signature' }, { status: 401 });
      }
    }

    const body = (await request.json()) as TossWebhookBody;
    if (!body?.data?.orderId) {
      return NextResponse.json({ error: '잘못된 webhook 페이로드' }, { status: 400 });
    }

    const sb = getSupabaseAdmin();

    // 결제 찾기
    const { data: payment } = await sb
      .from('payments')
      .select('*')
      .eq('order_id', body.data.orderId)
      .maybeSingle();

    if (!payment) {
      // 우리가 만든 주문 아님 — 다른 시스템의 결제일 수 있음. 200 OK로 응답해서 재시도 막음.
      await sb.from('payment_events').insert({
        payment_id: null,
        event_type: body.eventType,
        raw: body,
      });
      return NextResponse.json({ ok: true, ignored: true });
    }

    const p = payment as Payment;
    const newStatus = tossStatusToInternal(body.data.status);

    // 이벤트 로그
    await sb.from('payment_events').insert({
      payment_id: p.id,
      event_type: body.eventType,
      raw: body,
    });

    // 상태 변경 반영
    const updates: Partial<Payment> = { status: newStatus };
    if (newStatus === 'canceled' || newStatus === 'partial_canceled') {
      updates.canceled_at = new Date().toISOString();
    }

    await sb.from('payments').update(updates).eq('id', p.id);

    // 취소 시 활성화 무효화는 정책에 따라 별도 처리 가능
    // (지금은 환불 시 어드민이 수동으로 subscription/credit 조정)

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : '알 수 없는 오류';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
