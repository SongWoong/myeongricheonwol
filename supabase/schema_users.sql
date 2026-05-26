-- ============================================================
-- 명리천월 이메일 회원가입 스키마
-- Supabase Console → SQL Editor 에서 그대로 실행
-- ============================================================

create table if not exists public.users (
  email text primary key,
  password_hash text not null,
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_users_name on public.users (lower(name));

-- ============================================================
-- 끝.
-- ============================================================
