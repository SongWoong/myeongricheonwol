import { createClient, SupabaseClient } from '@supabase/supabase-js';

/* 서버 사이드 Supabase 클라이언트 (Service Role)
 * RLS 우회. API 라우트·webhook 에서만 사용.
 * 환경변수 없으면 throw — 결제 기능 활성화 조건.
 */

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase가 설정되지 않았습니다. .env.local에 NEXT_PUBLIC_SUPABASE_URL와 SUPABASE_SERVICE_ROLE_KEY를 넣어주세요.');
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
