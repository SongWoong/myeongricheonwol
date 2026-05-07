/**
 * 개발용 간이 유저 저장소 (파일 기반 JSON)
 * 실제 서비스에서는 Supabase 등 실제 DB로 교체 필요
 */

import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), ".user-db.json");

interface StoredUser {
  email: string;
  password: string; // 개발용 평문 저장 (실제 서비스에서는 bcrypt 등 해싱 필수)
  name: string;
  createdAt: string;
}

function readDb(): Record<string, StoredUser> {
  try {
    if (!fs.existsSync(DB_PATH)) return {};
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeDb(db: Record<string, StoredUser>) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export function findUserByEmail(email: string): StoredUser | undefined {
  const db = readDb();
  return db[email.toLowerCase()];
}

export function createUser(email: string, password: string, name: string): StoredUser {
  const db = readDb();
  const key = email.toLowerCase();
  if (db[key]) {
    throw new Error("이미 가입된 이메일입니다");
  }
  const user: StoredUser = {
    email: key,
    password,
    name,
    createdAt: new Date().toISOString(),
  };
  db[key] = user;
  writeDb(db);
  return user;
}

export function verifyPassword(user: StoredUser, password: string): boolean {
  return user.password === password;
}

/** 비밀번호 변경 (개발용) */
export function updatePassword(email: string, newPassword: string): boolean {
  const db = readDb();
  const key = email.toLowerCase();
  if (!db[key]) return false;
  db[key].password = newPassword;
  writeDb(db);
  return true;
}

/** 이름으로 이메일 찾기 */
export function findEmailByName(name: string): StoredUser | undefined {
  const db = readDb();
  return Object.values(db).find(
    (u) => u.name.toLowerCase() === name.toLowerCase()
  );
}

/** 이메일 존재 여부 확인 */
export function userExists(email: string): boolean {
  const db = readDb();
  return !!db[email.toLowerCase()];
}
