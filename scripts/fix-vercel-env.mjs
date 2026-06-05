#!/usr/bin/env node
/* Delete and recreate NEXT_PUBLIC_BIZ_* env vars via Vercel REST API.
 * Workaround for CLI bug where non-ASCII OS username breaks HTTP headers.
 */
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const PROJECT_ID = "prj_Lq5Mk2SiVYltVw5I0xkjy21ATQTW";
const TEAM_ID = "team_oWcA3x3yYAi7JIRj69HVeFMS";

const authPath = path.join(process.env.APPDATA || `${homedir()}/AppData/Roaming`, "com.vercel.cli/Data/auth.json");
const { token } = JSON.parse(readFileSync(authPath, "utf8"));

function api(method, url, body) {
  const u = new URL(url);
  u.searchParams.set("teamId", TEAM_ID);
  return fetch(u, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  }).then(async (r) => {
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    if (!r.ok) {
      throw new Error(`${method} ${url} → ${r.status}: ${text}`);
    }
    return data;
  });
}

function parseEnvFile(p) {
  const raw = readFileSync(p, "utf8");
  const map = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m) continue;
    let val = m[2];
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    map[m[1]] = val;
  }
  return map;
}

const envMap = parseEnvFile(".env.local");

const VARS_TO_FIX = [
  "NEXT_PUBLIC_BIZ_COMPANY",
  "NEXT_PUBLIC_BIZ_CEO",
  "NEXT_PUBLIC_BIZ_REG_NO",
  "NEXT_PUBLIC_BIZ_ECOMMERCE_NO",
  "NEXT_PUBLIC_BIZ_ADDRESS",
  "NEXT_PUBLIC_BIZ_PHONE",
  "NEXT_PUBLIC_BIZ_EMAIL",
  "NEXT_PUBLIC_BIZ_CPO",
];

console.log("Fetching existing env vars...");
const { envs } = await api("GET", `https://api.vercel.com/v9/projects/${PROJECT_ID}/env`);

for (const name of VARS_TO_FIX) {
  const matches = envs.filter((e) => e.key === name);
  for (const e of matches) {
    process.stdout.write(`Deleting ${name} (${e.target.join(",")}, id=${e.id})... `);
    try {
      await api("DELETE", `https://api.vercel.com/v9/projects/${PROJECT_ID}/env/${e.id}`);
      process.stdout.write("OK\n");
    } catch (err) {
      process.stdout.write(`FAIL: ${err.message}\n`);
    }
  }
}

console.log("\nRecreating env vars with clean UTF-8 values...");
for (const name of VARS_TO_FIX) {
  const value = envMap[name];
  if (!value) {
    console.warn(`! Skipping ${name} — not in .env.local`);
    continue;
  }
  process.stdout.write(`Creating ${name} = "${value}"... `);
  try {
    await api("POST", `https://api.vercel.com/v10/projects/${PROJECT_ID}/env`, {
      key: name,
      value,
      type: "encrypted",
      target: ["production", "development"],
    });
    process.stdout.write("OK\n");
  } catch (err) {
    process.stdout.write(`FAIL: ${err.message}\n`);
  }
}

console.log("\nDone. Verify by triggering a fresh deploy.");
