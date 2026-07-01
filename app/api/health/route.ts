import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";

/**
 * Health check (Sprint 15) — pour les sondes de disponibilité (Railway, Vercel,
 * load balancers, monitoring). Vérifie la connectivité à la base.
 *
 * 200 → { status: "ok" } · 503 → { status: "degraded" }.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const startedAt = Date.now();
  let dbOk = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch (error) {
    logger.error("healthcheck: base injoignable", { error: String(error) });
  }

  const body = {
    status: dbOk ? "ok" : "degraded",
    checks: { database: dbOk },
    uptime: Math.round(process.uptime()),
    latencyMs: Date.now() - startedAt,
    timestamp: new Date().toISOString(),
  };

  return Response.json(body, { status: dbOk ? 200 : 503 });
}
