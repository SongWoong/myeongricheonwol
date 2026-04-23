import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY;
  return NextResponse.json({
    hasKey: !!key,
    keyLength: key?.length ?? 0,
    keyPrefix: key ? key.slice(0, 12) + "..." : null,
    keyEnd: key ? "..." + key.slice(-4) : null,
    envVarsAvailable: Object.keys(process.env).filter((k) =>
      k.toLowerCase().includes("anthropic") ||
      k.toLowerCase().includes("api") ||
      k.toLowerCase().includes("key") ||
      k.toLowerCase().includes("road")
    ),
  });
}
