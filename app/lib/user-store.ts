/**
 * 이메일 회원가입 유저 저장소 — Supabase 기반.
 * password는 bcrypt로 해싱해서 저장.
 */

import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "./supabase";

export interface StoredUser {
  email: string;
  password_hash: string;
  name: string;
  created_at: string;
}

const SALT_ROUNDS = 10;

export async function findUserByEmail(email: string): Promise<StoredUser | undefined> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (error) {
    console.error("[findUserByEmail]", error);
    return undefined;
  }
  return data ?? undefined;
}

export async function createUser(email: string, password: string, name: string): Promise<StoredUser> {
  const key = email.toLowerCase();
  const existing = await findUserByEmail(key);
  if (existing) {
    throw new Error("이미 가입된 이메일입니다");
  }
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .insert({ email: key, password_hash, name })
    .select()
    .single();
  if (error || !data) {
    throw new Error(`회원가입 실패: ${error?.message ?? "알 수 없는 오류"}`);
  }
  return data;
}

export async function verifyPassword(user: StoredUser, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.password_hash);
}

export async function updatePassword(email: string, newPassword: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const { error } = await supabase
    .from("users")
    .update({ password_hash })
    .eq("email", email.toLowerCase());
  return !error;
}

export async function findEmailByName(name: string): Promise<StoredUser | undefined> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .ilike("name", name)
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("[findEmailByName]", error);
    return undefined;
  }
  return data ?? undefined;
}

export async function userExists(email: string): Promise<boolean> {
  return !!(await findUserByEmail(email));
}
