#!/usr/bin/env node
/* Push env vars to Vercel (production + preview).
 * Reads from .env.local, overrides production URLs.
 * Run: node scripts/push-vercel-env.mjs
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

// Vercel에 올릴 변수 목록
const VARS = [
  // 결제
  "PAYMENT_MODE",
  "TOSS_SECRET_KEY",
  "NEXT_PUBLIC_TOSS_CLIENT_KEY",
  "TOSS_WEBHOOK_SECRET",
  "NEXT_PUBLIC_PAYMENT_SUCCESS_URL",
  "NEXT_PUBLIC_PAYMENT_FAIL_URL",
  // Supabase
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  // 사업자정보
  "NEXT_PUBLIC_BIZ_COMPANY",
  "NEXT_PUBLIC_BIZ_CEO",
  "NEXT_PUBLIC_BIZ_REG_NO",
  "NEXT_PUBLIC_BIZ_ECOMMERCE_NO",
  "NEXT_PUBLIC_BIZ_ADDRESS",
  "NEXT_PUBLIC_BIZ_PHONE",
  "NEXT_PUBLIC_BIZ_EMAIL",
  "NEXT_PUBLIC_BIZ_CPO",
];

const PROD_OVERRIDES = {
  NEXT_PUBLIC_PAYMENT_SUCCESS_URL: "https://myeongricheonwol.vercel.app/checkout/success",
  NEXT_PUBLIC_PAYMENT_FAIL_URL:    "https://myeongricheonwol.vercel.app/checkout/fail",
};

function parseEnvFile(path) {
  const raw = readFileSync(path, "utf8");
  const map = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m) continue;
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    map[m[1]] = val;
  }
  return map;
}

function push(name, env, value) {
  try {
    // vercel env add NAME ENV --value VALUE --yes
    execSync(
      `npx vercel env add ${name} ${env} --value "${value.replace(/"/g, '\\"')}" --yes`,
      { stdio: "inherit", shell: true, env: { ...process.env, LANG: "en_US.UTF-8" } }
    );
    return true;
  } catch {
    return false;
  }
}

const envMap = parseEnvFile(".env.local");

for (const name of VARS) {
  const localVal = envMap[name];
  if (!localVal) {
    console.warn(`⚠ SKIP  ${name} (not in .env.local)`);
    continue;
  }

  // production
  const prodVal = PROD_OVERRIDES[name] ?? localVal;
  process.stdout.write(`▶ ${name} → production ... `);
  console.log(push(name, "production", prodVal) ? "✓" : "✗ FAIL");

  // preview (개발 미리보기용, production과 동일값)
  process.stdout.write(`▶ ${name} → preview ... `);
  console.log(push(name, "preview", prodVal) ? "✓" : "✗ FAIL");
}

console.log("\n완료. Vercel 대시보드에서 확인 후 재배포(redeploy)하세요.");
