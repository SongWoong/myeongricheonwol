import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/app/lib/supabase';
import { isPaymentEnabled } from '@/app/lib/payment/types';
import { confirmTossPayment, tossStatusToInternal } from '@/app/lib/payment/toss';
import { activateProduct } from '@/app/lib/payment/entitlement';
import type { Payment, Product } from '@/app/lib/payment/types';

/* POST /api/payment/confirm
 * body: { paymentKey, orderId, amount }
 * 토스에서 결제 후 redirect 받았을 때 호출 (서버에서 검증·승인).
 * 1) payments 행 조회 (pending)
 * 2) amount 일치 검증 (위변조 방지)
 * 3) Toss confirm API 호출
 * 4) DB 업데이트 + activateProduct (구독/크레딧 활성화)
 */
export async function POST(request: NextRequest) {
  try {
    if (!isPaymentEnabled() || !isSupabaseConfigured()) {
      return NextResponse.json({ error: '결제 시스템이 비활성화 상태입니다.' }, { status: 503 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = (await request.json()) as {
      paymentKey?: string;
      orderId?: string;
      amount?: number;
    };
    if (!body.paymentKey || !body.orderId || typeof body.amount !== 'number') {
      return NextResponse.json({ error: 'paymentKey, orderId, amount가 필요합니다.' }, { status: 400 });
    }

    const sb = getSupabaseAdmin();

    // 1) 기존 주문 조회
    const { data: payment, error: findErr } = await sb
      .from('payments')
      .select('*')
      .eq('order_id', body.orderId)
      .maybeSingle();

    if (findErr || !payment) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
    }

    const p = payment as Payment;
    if (p.user_id !== session.user.id) {
      return NextResponse.json({ error: '본인의 주문만 결제 승인할 수 있습니다.' }, { status: 403 });
    }
    if (p.status === 'done') {
      // 이미 처리됨 — idempotent
      return NextResponse.json({ ok: true, alreadyConfirmed: true, payment: p });
    }
    if (p.amount !== body.amount) {
      // 위변조 의심
      await sb.from('payments').update({
        status: 'failed',
        failure_code: 'AMOUNT_MISMATCH',
        failure_message: `expected ${p.amount}, got ${body.amount}`,
      }).eq('id', p.id);
      return NextResponse.json({ error: '금액이 일치하지 않습니다.' }, { status: 400 });
    }

    // 2) 토스 confirm API 호출
    let tossResp;
    try {
      tossResp = await confirmTossPayment({
        paymentKey: body.paymentKey,
        orderId: body.orderId,
        amount: body.amount,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : '토스 승인 실패';
      await sb.from('payments').update({
        status: 'failed',
        failure_code: 'TOSS_CONFIRM_ERROR',
        failure_message: msg,
      }).eq('id', p.id);
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const internalStatus = tossStatusToInternal(tossResp.status);

    // 3) DB 업데이트
    const { error: updateErr } = await sb.from('payments').update({
      status: internalStatus,
      toss_payment_key: tossResp.paymentKey,
      toss_method: tossResp.method,
      toss_raw: tossResp,
      paid_at: tossResp.approvedAt ? new Date(tossResp.approvedAt).toISOString() : new Date().toISOString(),
    }).eq('id', p.id);
    if (updateErr) {
      console.error('payments update error:', updateErr);
    }

    // 4) 상품 활성화 (구독·크레딧)
    let activation: { kind: string; detail: string } | null = null;
    if (internalStatus === 'done') {
      const { data: product } = await sb.from('products').select('*').eq('id', p.product_id).single();
      if (product) {
        activation = await activateProduct({
          userId: p.user_id,
          product: product as Product,
          paymentId: p.id,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      status: internalStatus,
      activation,
      payment: { ...p, status: internalStatus, toss_payment_key: tossResp.paymentKey },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : '알 수 없는 오류';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
