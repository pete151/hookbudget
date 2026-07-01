import "server-only";

import type { SubscriptionStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type { Paginated } from "@/services/admin/audit.service";

/**
 * Abonnements (Back Office). Lecture seule — aucun paiement réel.
 */

export interface SubscriptionStats {
  active: number;
  trial: number;
  cancelled: number;
  pastDue: number;
  total: number;
}

/** Répartition des abonnements par statut. */
export async function getSubscriptionStats(): Promise<SubscriptionStats> {
  const grouped = await prisma.subscription.groupBy({ by: ["status"], _count: { _all: true } });
  const byStatus = new Map(grouped.map((g) => [g.status as SubscriptionStatus, g._count._all]));
  const active = byStatus.get("ACTIVE") ?? 0;
  const trial = byStatus.get("TRIAL") ?? 0;
  const cancelled = byStatus.get("CANCELLED") ?? 0;
  const pastDue = byStatus.get("PAST_DUE") ?? 0;
  return { active, trial, cancelled, pastDue, total: active + trial + cancelled + pastDue };
}

export interface SubscriptionRow {
  id: string;
  plan: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  createdAt: Date;
  user: { id: string; name: string; email: string };
}

/** Liste paginée des abonnements (plus récents d'abord). */
export async function listSubscriptions(
  query: { status?: SubscriptionStatus; page?: number; pageSize?: number } = {},
): Promise<Paginated<SubscriptionRow>> {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));
  const where = query.status ? { status: query.status } : {};

  const [rows, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.subscription.count({ where }),
  ]);

  return {
    items: rows.map((s) => ({
      id: s.id,
      plan: s.plan,
      status: s.status,
      currentPeriodEnd: s.currentPeriodEnd,
      createdAt: s.createdAt,
      user: s.user,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export interface SubscriptionHistoryRow {
  id: string;
  plan: string;
  event: string;
  note: string | null;
  createdAt: Date;
  user: { id: string; name: string; email: string };
}

/** Historique global des événements d'abonnement. */
export async function getSubscriptionHistory(limit = 30): Promise<SubscriptionHistoryRow[]> {
  const rows = await prisma.subscriptionHistory.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return rows.map((h) => ({
    id: h.id,
    plan: h.plan,
    event: h.event,
    note: h.note,
    createdAt: h.createdAt,
    user: h.user,
  }));
}
