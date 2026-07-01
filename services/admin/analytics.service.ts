import "server-only";

import { Prisma, type PlanTier } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

/**
 * Analytics de la plateforme (Back Office).
 * Le MRR est un ESTIMÉ (aucun paiement réel) : somme des prix des plans des
 * abonnements actifs — clairement marqué « placeholder ».
 */

export interface PlatformAnalytics {
  totalUsers: number;
  newUsers30d: number;
  activeUsers30d: number;
  mrrPlaceholder: number;
  currency: string;
  planDistribution: { tier: PlanTier; count: number }[];
  growth: { label: string; count: number }[];
}

const MONTH_LABELS = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
];

const TIERS: PlanTier[] = ["FREE", "PRO", "BUSINESS", "ENTERPRISE"];

/** Agrège l'ensemble des indicateurs de la plateforme. */
export async function getPlatformAnalytics(): Promise<PlatformAnalytics> {
  const now = new Date();
  const since30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totalUsers, newUsers30d, activeSessions, subsByPlan, activeSubs, plans, growthRows] =
    await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { deletedAt: null, createdAt: { gte: since30 } } }),
      prisma.session.findMany({
        where: { updatedAt: { gte: since30 } },
        distinct: ["userId"],
        select: { userId: true },
      }),
      prisma.subscription.groupBy({ by: ["plan"], _count: { _all: true } }),
      prisma.subscription.findMany({ where: { status: "ACTIVE" }, select: { plan: true } }),
      prisma.plan.findMany({ select: { tier: true, price: true, currency: true } }),
      prisma.$queryRaw<{ ym: string; count: number }[]>(Prisma.sql`
        SELECT to_char(date_trunc('month', "createdAt"), 'YYYY-MM') AS ym,
               COUNT(*)::int AS count
        FROM "user"
        WHERE "deletedAt" IS NULL AND "createdAt" >= ${new Date(now.getFullYear(), now.getMonth() - 5, 1)}
        GROUP BY 1
      `),
    ]);

  // Répartition des plans : les abonnements FREE/PRO/BUSINESS + FREE implicite
  // (utilisateurs sans abonnement). ENTERPRISE = 0 (pas encore d'abonnement réel).
  const subCountByPlan = new Map(subsByPlan.map((s) => [s.plan as string, s._count._all]));
  const explicitSubs = subsByPlan.reduce((sum, s) => sum + s._count._all, 0);
  const implicitFree = Math.max(0, totalUsers - explicitSubs);

  const planDistribution = TIERS.map((tier) => {
    let count = subCountByPlan.get(tier) ?? 0;
    if (tier === "FREE") count += implicitFree;
    return { tier, count };
  });

  // MRR estimé : prix des plans des abonnements actifs.
  const priceByTier = new Map(
    plans.map((p) => [
      p.tier as string,
      typeof p.price === "number" ? p.price : p.price.toNumber(),
    ]),
  );
  const currency = plans[0]?.currency ?? "XOF";
  const mrrPlaceholder = activeSubs.reduce(
    (sum, s) => sum + (priceByTier.get(s.plan as string) ?? 0),
    0,
  );

  // Croissance : 6 derniers mois.
  const byKey = new Map(growthRows.map((r) => [r.ym, Number(r.count)]));
  const growth: { label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    growth.push({ label: MONTH_LABELS[d.getMonth()], count: byKey.get(key) ?? 0 });
  }

  return {
    totalUsers,
    newUsers30d,
    activeUsers30d: activeSessions.length,
    mrrPlaceholder,
    currency,
    planDistribution,
    growth,
  };
}
