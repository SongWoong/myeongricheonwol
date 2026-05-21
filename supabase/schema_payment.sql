-- ============================================================
-- 명리천월 결제 시스템 스키마
-- Supabase Console → SQL Editor 에서 그대로 실행
-- 이미 있는 테이블은 IF NOT EXISTS 로 건너뜀
-- ============================================================

-- ─── 1. products: 결제 가능한 상품 정의 ─────────────────
create table if not exists public.products (
  id text primary key,                            -- "saju-single", "monthly-unlimited" 등
  type text not null check (type in ('single', 'subscription', 'credit-pack')),
  name text not null,                             -- 표시용 이름 ("사주 풀이")
  description text,
  price integer not null,                         -- 원화 단위 (9900)
  currency text not null default 'KRW',
  -- single 전용
  feature text,                                   -- unlock 하는 기능 (saju, tarot, jami, dream...)
  -- subscription 전용
  interval_days integer,                          -- 30, 365
  unlimited_features text[],                      -- ["saju", "tarot", "jami"]
  -- credit-pack 전용
  credit_feature text,                            -- 어떤 기능 크레딧인지
  credit_amount integer,                          -- 100, 50 같은 충전 수
  -- 공통
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── 2. payments: 결제 이력 ──────────────────────────
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,                          -- NextAuth user.id
  user_email text,
  product_id text not null references public.products(id),
  order_id text unique not null,                  -- 토스에 전달하는 주문번호
  amount integer not null,
  currency text not null default 'KRW',
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'done', 'canceled', 'partial_canceled', 'failed', 'aborted')),
  toss_payment_key text unique,                   -- 토스 응답 paymentKey
  toss_method text,                               -- 카드 · 가상계좌 · 등
  toss_raw jsonb,                                 -- 토스 응답 전체 저장 (감사용)
  failure_code text,
  failure_message text,
  requested_at timestamptz not null default now(),
  paid_at timestamptz,
  canceled_at timestamptz
);
create index if not exists idx_payments_user on public.payments(user_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_order on public.payments(order_id);

-- ─── 3. subscriptions: 활성 구독 ────────────────────
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  product_id text not null references public.products(id),
  status text not null default 'active'
    check (status in ('active', 'canceled', 'expired')),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  last_payment_id uuid references public.payments(id),
  canceled_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_subs_user on public.subscriptions(user_id);
create index if not exists idx_subs_expires on public.subscriptions(expires_at);

-- ─── 4. user_credits: 크레딧 잔액 ───────────────────
create table if not exists public.user_credits (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  feature text not null,                          -- "saju", "tarot", etc.
  balance integer not null default 0,
  expires_at timestamptz,                         -- null이면 무기한
  last_payment_id uuid references public.payments(id),
  updated_at timestamptz not null default now(),
  unique (user_id, feature)
);
create index if not exists idx_credits_user on public.user_credits(user_id);

-- ─── 5. payment_events: webhook 이벤트 로그 ─────────
create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references public.payments(id),
  event_type text not null,                       -- "PAYMENT_STATUS_CHANGED" 등
  raw jsonb not null,
  received_at timestamptz not null default now()
);

-- ─── 6. 시드 데이터 ─────────────────────────────────
-- 가격 정책:
--   가벼움(소항목, 단순 풀이) = 2,900원
--   일반(올해 12개월 등 보통 길이) = 4,900원
--   무거움(종합·대운) = 7,900원
--   타로 3장 = 4,900원 / 켈틱 10장 = 7,900원
--   밀서(성인)는 일반 가격대 유지
--
-- feature 키 규칙:
--   "saju"            = 사주 베이스 (구독·풀세트팩이 이걸 사용)
--   "saju.general"    = 사주 특정 챕터 (단건 구매)
--   동일한 패턴: jami.*, milseo.*, tarot.*
-- 구독은 unlimited_features 가 베이스 ("saju") 만 가져도 모든 하위 챕터 커버

-- 사주 (8개 유료 챕터)
insert into public.products (id, type, name, description, price, feature, sort_order) values
  ('saju.general',  'single', '사주 종합 풀이',     '사주 총평·대운·올해 흐름 종합', 7900, 'saju.general', 110),
  ('saju.daewoon',  'single', '사주 대운 자세히',   '10년 단위 인생 큰 흐름',         7900, 'saju.daewoon', 111),
  ('saju.thisyear', 'single', '사주 올해 12개월',   '올해 월별 흐름 자세히',          4900, 'saju.thisyear', 112),
  ('saju.love',     'single', '사주 사랑·인연',     '연애·결혼·배우자·궁합',          2900, 'saju.love',     113),
  ('saju.money',    'single', '사주 재물·금전',     '재산·투자·돈의 흐름',            2900, 'saju.money',    114),
  ('saju.career',   'single', '사주 직업·진로',     '적성·이직·승진·자영업',          2900, 'saju.career',   115),
  ('saju.health',   'single', '사주 건강·체질',     '체질·약한 부위·관리법',          2900, 'saju.health',   116),
  ('saju.family',   'single', '사주 가족·자녀',     '부모·형제·배우자·자녀운',        2900, 'saju.family',   117)
on conflict (id) do nothing;

-- 자미두수 (9개 유료 챕터)
insert into public.products (id, type, name, description, price, feature, sort_order) values
  ('jami.general',  'single', '자미 종합 명반',     '12궁 전체 흐름 + 자미성 인연',   7900, 'jami.general', 210),
  ('jami.daewoon',  'single', '자미 대한 자세히',   '10년 단위 인생 큰 흐름',         7900, 'jami.daewoon', 211),
  ('jami.thisyear', 'single', '자미 올해 12개월',   '올해 월별 흐름 자세히',          4900, 'jami.thisyear', 212),
  ('jami.love',     'single', '자미 사랑·인연',     '부처궁·결혼·배우자상',           2900, 'jami.love',     213),
  ('jami.money',    'single', '자미 재물·금전',     '재백궁·전택궁·돈 흐름',          2900, 'jami.money',    214),
  ('jami.career',   'single', '자미 직업·진로',     '관록궁·천이궁·일의 흐름',        2900, 'jami.career',   215),
  ('jami.health',   'single', '자미 건강·체질',     '질액궁·신궁·약한 부위',          2900, 'jami.health',   216),
  ('jami.family',   'single', '자미 가족·자녀',     '부모·형제·자녀궁',               2900, 'jami.family',   217),
  ('jami.fortune',  'single', '자미 복덕·마음',     '복덕궁·정신·취향',               2900, 'jami.fortune',  218)
on conflict (id) do nothing;

-- 타로 (2개 유료 스프레드)
insert into public.products (id, type, name, description, price, feature, sort_order) values
  ('tarot.ppf',    'single', '타로 과거·현재·미래', '3장 스프레드 1회', 4900, 'tarot.ppf',    310),
  ('tarot.celtic', 'single', '타로 켈틱 크로스',     '10장 켈틱 스프레드 1회', 7900, 'tarot.celtic', 311)
on conflict (id) do nothing;

-- 밀서 (6개 유료 챕터, 19세 이상)
insert into public.products (id, type, name, description, price, feature, sort_order) values
  ('milseo.intimate', 'single', '밀서 친밀한 별자', '관계의 깊은 결과 호환',         7900, 'milseo.intimate', 410),
  ('milseo.desire',   'single', '밀서 숨겨진 욕망', '본인이 모르는 본능의 결',       4900, 'milseo.desire',   411),
  ('milseo.charm',    'single', '밀서 매력의 비밀', '사람을 끄는 진짜 무기',         4900, 'milseo.charm',    412),
  ('milseo.danger',   'single', '밀서 위험한 인연', '끌리지만 다치는 상대',          4900, 'milseo.danger',   413),
  ('milseo.secret',   'single', '밀서 은밀한 만남', '외도·짝사랑·비밀 연애',         4900, 'milseo.secret',   414),
  ('milseo.karma',    'single', '밀서 전생의 인연', '운명적 끌림과 카르마',          4900, 'milseo.karma',    415)
on conflict (id) do nothing;

-- 캐릭터 풀세트 패스 (credit-pack — base feature 에 챕터 수만큼 크레딧 충전)
insert into public.products (id, type, name, description, price, credit_feature, credit_amount, sort_order) values
  ('saju.fullpack',   'credit-pack', '사주 풀세트 패스',
   '자운의 모든 유료 챕터 8회분 (개별 구매 35,200원 → 30% 할인)',
   24900, 'saju',   8, 150),
  ('jami.fullpack',   'credit-pack', '자미두수 풀세트 패스',
   '성연의 모든 유료 챕터 9회분 (개별 구매 38,100원 → 27% 할인)',
   27900, 'jami',   9, 250),
  ('milseo.fullpack', 'credit-pack', '밀서 풀세트 패스',
   '밀서의 모든 유료 챕터 6회분 (개별 구매 33,400원 → 25% 할인)',
   24900, 'milseo', 6, 450)
on conflict (id) do nothing;

-- 구독 (일반 트랙: 사주+자미+타로)
insert into public.products (id, type, name, description, price, interval_days, unlimited_features, sort_order) values
  ('monthly-unlimited', 'subscription', '월 무제한',
   '사주·자미두수·타로 한 달 무제한 (밀서 제외)',
   60000, 30, array['saju','jami','tarot'], 500),
  ('yearly-unlimited',  'subscription', '연 무제한 (33% 할인)',
   '월 60,000원 → 연 480,000원 (월 환산 40,000원)',
   480000, 365, array['saju','jami','tarot'], 510)
on conflict (id) do nothing;

-- 구독 (밀서 애드온 — 일반 구독자가 추가 가입)
insert into public.products (id, type, name, description, price, interval_days, unlimited_features, sort_order) values
  ('milseo-monthly', 'subscription', '밀서 월 무제한 (애드온)',
   '밀서(성인) 챕터 한 달 무제한. 일반 구독과 별도 가입.',
   30000, 30, array['milseo'], 600),
  ('milseo-yearly',  'subscription', '밀서 연 무제한 (애드온)',
   '월 30,000원 → 연 240,000원 (33% 할인)',
   240000, 365, array['milseo'], 610)
on conflict (id) do nothing;

-- ─── 7. 헬퍼 뷰: 사용자별 활성 권한 ─────────────────
create or replace view public.user_entitlements as
select
  s.user_id,
  unnest(p.unlimited_features) as feature,
  s.expires_at
from public.subscriptions s
join public.products p on p.id = s.product_id
where s.status = 'active' and s.expires_at > now();

-- ============================================================
-- 끝. 실행 후 Supabase Console > Table Editor 에서 확인.
-- ============================================================
