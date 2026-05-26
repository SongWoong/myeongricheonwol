#!/usr/bin/env node
/* Push missing env vars to Vercel for all three environments.
 * Reads values from .env.local, calls `vercel env add <name> <env>` with stdin.
 * UTF-8 safe.
 */
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

const VARS = [
  "NEXT_PUBLIC_BIZ_ECOMMERCE_NO",
  "NEXT_PUBLIC_BIZ_ADDRESS",
];

const ENVS = ["preview"];

function parseEnvFile(path) {
  const raw = readFileSync(path, "utf8");
  const map = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m) continue;
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    map[m[1]] = val;
  }
  return map;
}

function addEnv(name, env, value) {
  return new Promise((resolve, reject) => {
    const quoted = `"${value.replace(/"/g, '\\"')}"`;
    const args = ["vercel", "env", "add", name, env, "--value", quoted, "--yes"];
    const child = spawn("npx", args, {
      stdio: ["ignore", "inherit", "inherit"],
      shell: true,
    });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`exit ${code}`));
    });
    child.on("error", reject);
  });
}

const envMap = parseEnvFile(".env.local");

for (const name of VARS) {
  const value = envMap[name];
  if (!value) {
    console.warn(`! Skipping ${name} — not found or empty in .env.local`);
    continue;
  }
  for (const env of ENVS) {
    process.stdout.write(`> ${name} → ${env}... `);
    try {
      await addEnv(name, env, value);
      process.stdout.write("OK\n");
    } catch (e) {
      process.stdout.write(`FAIL (${e.message})\n`);
    }
  }
}

console.log("\nDone. Verify: npx vercel env ls production");
