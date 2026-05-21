# 명리천월 결제 시스템 셋업 가이드

토스페이먼츠 + Supabase 기반 결제 시스템. 본인 또는 클라이언트가 이 가이드대로 키만 받아오면 됩니다.

---

## 1) Supabase 셋업 (5분)

이미 Supabase 프로젝트가 있으면 2번부터.

1. https://supabase.com 접속 → 새 프로젝트 생성
2. **Settings → API** 에서 두 값 복사:
   - Project URL (예: `https://xxxxx.supabase.co`)
   - **service_role** key (anon 키 아님)
3. **SQL Editor** 열기 → `supabase/schema_payment.sql` 파일 내용 전체 복사 → 실행
4. **Table Editor** 에서 `products` 테이블에 시드 6개 들어갔는지 확인

---

## 2) 토스페이먼츠 가입 (1~3일 소요)

1. https://www.tosspayments.com → 가맹점 가입
2. 사업자등록증 사진 업로드
3. 통신판매업신고증 (있으면)
4. 사업자 통장 사본
5. 심사 대기 (보통 1~3일)
6. 승인 후 **개발자센터** 로그인 → **API 키** 발급
7. 두 키 복사:
   - **Client Key** (`test_ck_...` 또는 `live_ck_...`) — 프론트엔드용
   - **Secret Key** (`test_sk_...` 또는 `live_sk_...`) — 서버용
8. **상점 정보 → 결제연동 → 콜백 URL** 설정:
   - 성공: `https://본인도메인/checkout/success`
   - 실패: `https://본인도메인/checkout/fail`
9. **웹훅 URL** 설정 (선택, 환불·취소 자동 동기화):
   - `https://본인도메인/api/payment/webhook`

---

## 3) `.env.local` 작성

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# 토스페이먼츠
PAYMENT_MODE=test                          # test | live | disabled
TOSS_SECRET_KEY=test_sk_xxx
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_xxx
TOSS_WEBHOOK_SECRET=                       # (선택) 웹훅 검증용
NEXT_PUBLIC_PAYMENT_SUCCESS_URL=http://localhost:3000/checkout/success
NEXT_PUBLIC_PAYMENT_FAIL_URL=http://localhost:3000/checkout/fail
```

**테스트 카드** (test 모드 전용):
- 카드번호: `4242 4242 4242 4242`
- 유효기간: 미래 아무 날짜
- CVC: 아무 3자리
- 비밀번호: 아무 2자리

`PAYMENT_MODE=disabled` 면 결제 시도 시 "비활성 상태" 안내문이 표시되어 다른 기능에 영향 없음.

---

## 4) 동작 확인

1. `npm run dev` → http://localhost:3000/pricing
2. 상품 카드가 보이면 성공 (DB에 들어간 6개)
3. 로그인 후 "결제하기" 클릭
4. 테스트 카드로 결제
5. 성공 페이지 도착 → http://localhost:3000/account/billing 에서 구독·크레딧 확인

---

## 5) 운영 전환 (test → live)

1. 토스 콘솔에서 **운영 키** 발급
2. `.env.local` (또는 Vercel 환경변수):
   ```
   PAYMENT_MODE=live
   TOSS_SECRET_KEY=live_sk_xxx
   NEXT_PUBLIC_TOSS_CLIENT_KEY=live_ck_xxx
   ```
3. Vercel 재배포
4. 첫 결제 본인 카드로 1,000원 정도 테스트 → 환불

---

## 6) 상품 추가/수정

Supabase Table Editor 에서 `products` 테이블 직접 편집.

```sql
-- 예: 새 단건 상품
insert into public.products (id, type, name, description, price, feature, sort_order)
values ('saju-deep', 'single', '사주 심층 풀이', '90분 분량의 심층 풀이 + PDF', 49000, 'saju', 15);

-- 가격만 변경
update public.products set price = 12900 where id = 'saju-single';

-- 비활성화
update public.products set active = false where id = 'tarot-single';
```

UI는 자동으로 반영됩니다 (재배포 불필요).

---

## 7) 클라이언트(다른 사주 사업자)에게 fork 판매 시

1. 본인이 코드 fork → 클라이언트 GitHub 또는 Vercel 계정으로 인계
2. 클라이언트가 본인 명의로 토스 가맹점 가입 (위 2번 절차)
3. 클라이언트가 본인 Supabase 프로젝트 생성 (위 1번 절차)
4. 클라이언트가 본인 .env 셋업
5. 본인은 셋업·디자인 커스터마이즈만 진행

→ **결제 돈은 클라이언트 통장으로, 본인은 제작·셋업비만 받음.** 표준적인 SaaS 템플릿 판매 모델.

---

## 8) 트러블슈팅

| 증상 | 원인·해결 |
|---|---|
| `/pricing` 에 상품 없음 | Supabase products 테이블 확인. schema_payment.sql 실행 필요 |
| "결제 시스템 비활성" 표시 | `PAYMENT_MODE=test` 또는 `live` 로 변경 + 토스 키 입력 |
| 결제 후 success 페이지에서 "승인 실패" | TOSS_SECRET_KEY가 올바른지 확인. Client/Secret 짝이 같은지 |
| 결제 후 구독·크레딧 안 들어옴 | Supabase products 테이블에 해당 product_id 가 있는지, type이 정확한지 |
| 환불 후 사이트에 반영 안 됨 | webhook URL이 토스 콘솔에 등록됐는지 |

---

## 코드 구조 요약

```
app/api/payment/
  checkout/route.ts     주문 생성
  confirm/route.ts      결제 승인 (토스 redirect 후)
  webhook/route.ts      취소·환불 동기화
  me/route.ts           내 구독·크레딧 조회

app/lib/payment/
  types.ts              타입 + 모드 판별
  toss.ts               토스 API 호출
  entitlement.ts        권한 조회 + 활성화 + 크레딧 차감

app/lib/supabase.ts     서버 Supabase 클라이언트

app/pricing/page.tsx               상품 목록
app/checkout/[productId]/page.tsx  결제 위젯
app/checkout/success/page.tsx      결제 완료 (자동 승인)
app/checkout/fail/page.tsx         결제 실패
app/account/billing/page.tsx       내 결제 내역

supabase/schema_payment.sql        DB 스키마 (수동 실행)
```

---

## 권한 가드 — 기존 사주·타로 등에서 사용

```typescript
// 예: app/api/saju/route.ts 안에서
import { canUseFeature, consumeCredit } from '@/app/lib/payment/entitlement';

const check = await canUseFeature(session.user.id, 'saju');
if (!check.allowed) {
  return NextResponse.json(
    { error: '이용권이 필요합니다.', redirectTo: '/pricing' },
    { status: 402 },
  );
}

// 풀이 실행...

if (check.reason === 'credits') {
  await consumeCredit(session.user.id, 'saju');
}
```

→ 무료 한도(`limits.ts`) 와 결합:
1. 먼저 무료 한도 체크
2. 한도 넘으면 `canUseFeature` 체크
3. 둘 다 실패면 `/pricing` 으로 유도
