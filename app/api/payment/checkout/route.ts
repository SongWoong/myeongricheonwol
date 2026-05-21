import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/app/lib/supabase';
import { isPaymentEnabled } from '@/app/lib/payment/types';
import { generateOrderId } from '@/app/lib/payment/toss';
import type { Product } from '@/app/lib/payment/types';

/* POST /api/payment/checkout
 * body: { productId }
 * 주문 생성 (DB에 pending 상태로 기록) → 토스 위젯에 전달할 정보 반환.
 */
export async function POST(request: NextRequest) {
  try {
    if (!isPaymentEnabled()) {
      return NextResponse.json(
        { error: '결제가 비활성화 상태입니다. 관리자에게 토스 키 설정을 요청하세요.' },
        { status: 503 },
      );
    }
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Supabase가 설정되지 않았습니다.' },
        { status: 503 },
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = (await request.json()) as { productId?: string };
    if (!body.productId) {
      return NextResponse.json({ error: 'productId가 필요합니다.' }, { status: 400 });
    }

    const sb = getSupabaseAdmin();
    const { data: product, error: productErr } = await sb
      .from('products')
      .select('*')
      .eq('id', body.productId)
      .eq('active', true)
      .maybeSingle();

    if (productErr || !product) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }

    const p = product as Product;
    const orderId = generateOrderId();

    const { error: insertErr } = await sb.from('payments').insert({
      user_id: session.user.id,
      user_email: session.user.email,
      product_id: p.id,
      order_id: orderId,
      amount: p.price,
      currency: p.currency,
      status: 'pending',
    });

    if (insertErr) {
      console.error('payments insert error:', insertErr);
      return NextResponse.json({ error: '주문 생성 실패' }, { status: 500 });
    }

    return NextResponse.json({
      orderId,
      orderName: p.name,
      amount: p.price,
      currency: p.currency,
      productId: p.id,
      clientKey: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
      successUrl:
        process.env.NEXT_PUBLIC_PAYMENT_SUCCESS_URL ||
        `${request.nextUrl.origin}/checkout/success`,
      failUrl:
        process.env.NEXT_PUBLIC_PAYMENT_FAIL_URL ||
        `${request.nextUrl.origin}/checkout/fail`,
      customerEmail: session.user.email,
      customerName: session.user.name || session.user.email,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : '알 수 없는 오류';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
