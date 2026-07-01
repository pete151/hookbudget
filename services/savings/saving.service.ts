import "server-only";

import { Prisma, type SavingGoal, type SavingPriority, type SavingStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type { SavingGoalFormValues, ContributionFormValues } from "@/lib/validations/saving";
import type { MonthlyPoint, CategorySlice } from "@/services/dashboard/dashboard.service";

/**
 * Couche de services des objectifs d'épargne et de leurs contributions.
 * `currentAmount` est recalculé à partir des contributions lorsque
 * `autoCalculate = true`. Le statut passe automatiquement à COMPLETED lorsque
 * la cible est atteinte (sauf si l'objectif est en pause ou annulé).
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const PALETTE = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#ef4444",
  "#0ea5e9",
];
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

// ── Types ────────────────────────────────────────────────────────────────

export interface SavingGoalView {
  id: string;
  name: string;
  description: string | null;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  percent: number;
  targetDate: Date | null;
  priority: SavingPriority;
  status: SavingStatus;
  color: string | null;
  icon: string | null;
  autoCalculate: boolean;
  /** Jours restants avant la date cible (négatif si dépassée), ou null. */
  daysRemaining: number | null;
  /** Date estimée d'atteinte selon le rythme de contribution, ou null. */
  estimatedDate: Date | null;
  createdAt: Date;
}

export interface ContributionView {
  id: string;
  amount: number;
  contributionDate: Date;
  note: string | null;
  createdAt: Date;
}

export type SavingGoalDetail = SavingGoalView & { contributions: ContributionView[] };

export interface SavingsStatistics {
  totalSaved: number;
  goalCount: number;
  completedCount: number;
  activeCount: number;
  average: number;
}

export interface SavingCharts {
  monthlyContributions: MonthlyPoint[];
  monthlyProgress: MonthlyPoint[];
  distribution: CategorySlice[];
}

export class SavingServiceError extends Error {}

// ── Helpers ────────────────────────────────────────────────────────────────

function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : value.toNumber();
}

function parseDate(value: string): Date {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new SavingServiceError("Date invalide.");
  return d;
}

/** Estime la date d'atteinte selon le rythme moyen de contribution. */
function estimateCompletion(
  currentAmount: number,
  remaining: number,
  firstDate: Date | null,
): Date | null {
  if (remaining <= 0 || currentAmount <= 0 || !firstDate) return null;
  const daysSinceFirst = Math.max(1, (Date.now() - firstDate.getTime()) / DAY_MS);
  const ratePerDay = currentAmount / daysSinceFirst;
  if (ratePerDay <= 0) return null;
  const daysNeeded = Math.ceil(remaining / ratePerDay);
  return new Date(Date.now() + daysNeeded * DAY_MS);
}

type GoalAggregate = {
  _sum: { amount: Prisma.Decimal | null };
  _min: { contributionDate: Date | null };
};

function toView(goal: SavingGoal, agg?: GoalAggregate): SavingGoalView {
  const targetAmount = toNumber(goal.targetAmount);
  const currentAmount = toNumber(goal.currentAmount);
  const remainingAmount = Math.max(0, targetAmount - currentAmount);
  const percent = targetAmount > 0 ? Math.round((currentAmount / targetAmount) * 100) : 0;

  const daysRemaining = goal.targetDate
    ? Math.ceil((goal.targetDate.getTime() - Date.now()) / DAY_MS)
    : null;
  const estimatedDate = estimateCompletion(
    currentAmount,
    remainingAmount,
    agg?._min.contributionDate ?? null,
  );

  return {
    id: goal.id,
    name: goal.name,
    description: goal.description,
    targetAmount,
    currentAmount,
    remainingAmount,
    percent,
    targetDate: goal.targetDate,
    priority: goal.priority,
    status: goal.status,
    color: goal.color,
    icon: goal.icon,
    autoCalculate: goal.autoCalculate,
    daysRemaining,
    estimatedDate,
    createdAt: goal.createdAt,
  };
}

/** Vérifie qu'un objectif appartient à l'utilisateur (sinon lève). */
async function loadOwnedGoal(userId: string, id: string): Promise<SavingGoal> {
  const goal = await prisma.savingGoal.findFirst({ where: { id, userId } });
  if (!goal) throw new SavingServiceError("Objectif introuvable.");
  return goal;
}

/** Recalcule `currentAmount` (si auto) et le statut d'un objectif. */
async function recalcGoal(goalId: string): Promise<void> {
  const goal = await prisma.savingGoal.findUnique({ where: { id: goalId } });
  if (!goal) return;

  let currentAmount = toNumber(goal.currentAmount);
  if (goal.autoCalculate) {
    const agg = await prisma.savingContribution.aggregate({
      _sum: { amount: true },
      where: { savingGoalId: goalId },
    });
    currentAmount = toNumber(agg._sum.amount);
  }

  let status: SavingStatus = goal.status;
  if (status !== "PAUSED" && status !== "CANCELLED") {
    status = currentAmount >= toNumber(goal.targetAmount) ? "COMPLETED" : "ACTIVE";
  }

  await prisma.savingGoal.update({ where: { id: goalId }, data: { currentAmount, status } });
}

// ── Lecture ────────────────────────────────────────────────────────────────

/** Tous les objectifs de l'utilisateur, avec progression et estimation. */
export async function getSavingGoals(userId: string): Promise<SavingGoalView[]> {
  const goals = await prisma.savingGoal.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
  if (goals.length === 0) return [];

  const agg = await prisma.savingContribution.groupBy({
    by: ["savingGoalId"],
    _sum: { amount: true },
    _min: { contributionDate: true },
    where: { savingGoalId: { in: goals.map((g) => g.id) } },
  });
  const aggById = new Map(agg.map((a) => [a.savingGoalId, a]));

  return goals.map((g) => toView(g, aggById.get(g.id)));
}

/** Un objectif + ses contributions, uniquement s'il appartient à l'utilisateur. */
export async function getSavingGoalById(
  userId: string,
  id: string,
): Promise<SavingGoalDetail | null> {
  const goal = await prisma.savingGoal.findFirst({
    where: { id, userId },
    include: { contributions: { orderBy: { contributionDate: "desc" } } },
  });
  if (!goal) return null;

  const firstDate = goal.contributions.reduce<Date | null>((min, c) => {
    return !min || c.contributionDate < min ? c.contributionDate : min;
  }, null);

  const view = toView(goal, { _sum: { amount: null }, _min: { contributionDate: firstDate } });

  return {
    ...view,
    contributions: goal.contributions.map((c) => ({
      id: c.id,
      amount: toNumber(c.amount),
      contributionDate: c.contributionDate,
      note: c.note,
      createdAt: c.createdAt,
    })),
  };
}

/** Progression d'un objectif (recalcul + valeurs dérivées). */
export async function calculateProgress(
  userId: string,
  id: string,
): Promise<{ current: number; remaining: number; percent: number; daysRemaining: number | null }> {
  const goal = await loadOwnedGoal(userId, id);
  await recalcGoal(id);

  const target = toNumber(goal.targetAmount);
  const current = toNumber((await prisma.savingGoal.findUnique({ where: { id } }))?.currentAmount);
  const remaining = Math.max(0, target - current);
  return {
    current,
    remaining,
    percent: target > 0 ? Math.round((current / target) * 100) : 0,
    daysRemaining: goal.targetDate
      ? Math.ceil((goal.targetDate.getTime() - Date.now()) / DAY_MS)
      : null,
  };
}

/** Statistiques globales des objectifs. */
export async function getSavingsStatistics(userId: string): Promise<SavingsStatistics> {
  const [agg, statusCounts] = await Promise.all([
    prisma.savingGoal.aggregate({
      where: { userId },
      _sum: { currentAmount: true },
      _avg: { currentAmount: true },
      _count: true,
    }),
    prisma.savingGoal.groupBy({ by: ["status"], _count: true, where: { userId } }),
  ]);

  const byStatus = new Map(statusCounts.map((s) => [s.status, s._count]));

  return {
    totalSaved: toNumber(agg._sum.currentAmount),
    goalCount: agg._count,
    completedCount: byStatus.get("COMPLETED") ?? 0,
    activeCount: byStatus.get("ACTIVE") ?? 0,
    average: toNumber(agg._avg.currentAmount),
  };
}

/** Données des graphiques d'épargne. */
export async function getSavingCharts(userId: string): Promise<SavingCharts> {
  const now = new Date();
  const since = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const [goals, monthlyRows, baselineRows] = await Promise.all([
    prisma.savingGoal.findMany({
      where: { userId },
      orderBy: { targetAmount: "desc" },
      select: { name: true, color: true, targetAmount: true },
    }),
    prisma.$queryRaw<{ ym: string; total: number }[]>(Prisma.sql`
      SELECT to_char(date_trunc('month', c."contributionDate"), 'YYYY-MM') AS ym,
             COALESCE(SUM(c."amount"), 0)::float8 AS total
      FROM "saving_contribution" c
      JOIN "saving_goal" g ON g."id" = c."savingGoalId"
      WHERE g."userId" = ${userId} AND c."contributionDate" >= ${since}
      GROUP BY 1
    `),
    prisma.$queryRaw<{ total: number }[]>(Prisma.sql`
      SELECT COALESCE(SUM(c."amount"), 0)::float8 AS total
      FROM "saving_contribution" c
      JOIN "saving_goal" g ON g."id" = c."savingGoalId"
      WHERE g."userId" = ${userId} AND c."contributionDate" < ${since}
    `),
  ]);

  const byKey = new Map(monthlyRows.map((r) => [r.ym, Number(r.total)]));

  const monthlyContributions: MonthlyPoint[] = [];
  const monthlyProgress: MonthlyPoint[] = [];
  let cumulative = Number(baselineRows[0]?.total ?? 0);

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const value = byKey.get(key) ?? 0;
    cumulative += value;
    const label = MONTH_LABELS[d.getMonth()];
    monthlyContributions.push({ key, label, value });
    monthlyProgress.push({ key, label, value: cumulative });
  }

  const distribution: CategorySlice[] = goals
    .map((g, i) => ({
      name: g.name,
      color: g.color ?? PALETTE[i % PALETTE.length],
      value: toNumber(g.targetAmount),
    }))
    .filter((s) => s.value > 0);

  return { monthlyContributions, monthlyProgress, distribution };
}

// ── Écriture — objectifs ────────────────────────────────────────────────────

function normalizeGoal(data: SavingGoalFormValues) {
  return {
    name: data.name,
    description: data.description?.trim() ? data.description.trim() : null,
    targetAmount: data.targetAmount,
    targetDate: data.targetDate ? parseDate(data.targetDate) : null,
    priority: data.priority,
    color: data.color,
    icon: data.icon,
  };
}

/** Crée un objectif d'épargne. */
export async function createSavingGoal(
  userId: string,
  data: SavingGoalFormValues,
): Promise<SavingGoalView> {
  const created = await prisma.savingGoal.create({ data: { ...normalizeGoal(data), userId } });
  await recalcGoal(created.id);
  const refreshed = await prisma.savingGoal.findUnique({ where: { id: created.id } });
  return toView(refreshed!);
}

/** Modifie un objectif d'épargne. */
export async function updateSavingGoal(
  userId: string,
  id: string,
  data: SavingGoalFormValues,
): Promise<SavingGoalView> {
  await loadOwnedGoal(userId, id);
  await prisma.savingGoal.update({ where: { id }, data: normalizeGoal(data) });
  await recalcGoal(id);
  const refreshed = await prisma.savingGoal.findUnique({ where: { id } });
  return toView(refreshed!);
}

/** Supprime un objectif (et ses contributions en cascade). */
export async function deleteSavingGoal(userId: string, id: string): Promise<void> {
  await loadOwnedGoal(userId, id);
  await prisma.savingGoal.delete({ where: { id } });
}

// ── Écriture — contributions ────────────────────────────────────────────────

/** Vérifie qu'une contribution appartient à un objectif de l'utilisateur. */
async function loadOwnedContributionGoalId(
  userId: string,
  contributionId: string,
): Promise<string> {
  const contribution = await prisma.savingContribution.findFirst({
    where: { id: contributionId, savingGoal: { userId } },
    select: { savingGoalId: true },
  });
  if (!contribution) throw new SavingServiceError("Contribution introuvable.");
  return contribution.savingGoalId;
}

/** Ajoute une contribution à un objectif, puis recalcule sa progression. */
export async function addContribution(
  userId: string,
  goalId: string,
  data: ContributionFormValues,
): Promise<void> {
  await loadOwnedGoal(userId, goalId);
  await prisma.savingContribution.create({
    data: {
      savingGoalId: goalId,
      amount: data.amount,
      contributionDate: parseDate(data.contributionDate),
      note: data.note?.trim() ? data.note.trim() : null,
    },
  });
  await recalcGoal(goalId);
}

/** Modifie une contribution, puis recalcule l'objectif. */
export async function updateContribution(
  userId: string,
  contributionId: string,
  data: ContributionFormValues,
): Promise<void> {
  const goalId = await loadOwnedContributionGoalId(userId, contributionId);
  await prisma.savingContribution.update({
    where: { id: contributionId },
    data: {
      amount: data.amount,
      contributionDate: parseDate(data.contributionDate),
      note: data.note?.trim() ? data.note.trim() : null,
    },
  });
  await recalcGoal(goalId);
}

/** Supprime une contribution, puis recalcule l'objectif. */
export async function deleteContribution(userId: string, contributionId: string): Promise<void> {
  const goalId = await loadOwnedContributionGoalId(userId, contributionId);
  await prisma.savingContribution.delete({ where: { id: contributionId } });
  await recalcGoal(goalId);
}
