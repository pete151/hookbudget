import "server-only";

import { Prisma, type Budget, type BudgetType, type BudgetPeriod } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type { BudgetFormValues } from "@/lib/validations/budget";
import type { MonthlyPoint, CategorySlice } from "@/services/dashboard/dashboard.service";

/**
 * Couche de services des budgets.
 *
 * Un budget suit automatiquement sa consommation : `spentAmount` /
 * `remainingAmount` sont recalculés à partir des dépenses de l'utilisateur sur
 * la période du budget, à chaque mouvement de dépense (via
 * `recalculateUserBudgets`) et à chaque création/modification de budget.
 */

export type BudgetStatus = "ok" | "warning" | "danger" | "inactive";

export interface BudgetView {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  spentAmount: number;
  remainingAmount: number;
  /** Pourcentage consommé (non borné : peut dépasser 100). */
  percent: number;
  budgetType: BudgetType;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  status: BudgetStatus;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  alert50: boolean;
  alert80: boolean;
  alert100: boolean;
}

export interface BudgetStatistics {
  totalBudget: number;
  usedBudget: number;
  remainingBudget: number;
  averageBudget: number;
  activeCount: number;
}

export interface BudgetProgressPoint {
  name: string;
  amount: number;
  spent: number;
}

export interface BudgetCharts {
  distribution: CategorySlice[];
  monthlyConsumption: MonthlyPoint[];
  progress: BudgetProgressPoint[];
}

export class BudgetServiceError extends Error {}

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

// ── Helpers ────────────────────────────────────────────────────────────────

function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : value.toNumber();
}

function parseDate(value: string): Date {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new BudgetServiceError("Date invalide.");
  return d;
}

/** Détermine le statut d'affichage d'un budget. */
function computeStatus(isActive: boolean, percent: number): BudgetStatus {
  if (!isActive) return "inactive";
  if (percent >= 80) return "danger";
  if (percent >= 50) return "warning";
  return "ok";
}

type BudgetWithCategory = Budget & {
  category: { name: string; color: string | null } | null;
};

function toView(budget: BudgetWithCategory): BudgetView {
  const amount = toNumber(budget.amount);
  const spentAmount = toNumber(budget.spentAmount);
  const remainingAmount = toNumber(budget.remainingAmount);
  const percent = amount > 0 ? Math.round((spentAmount / amount) * 100) : 0;

  return {
    id: budget.id,
    name: budget.name,
    description: budget.description,
    amount,
    spentAmount,
    remainingAmount,
    percent,
    budgetType: budget.budgetType,
    period: budget.period,
    startDate: budget.startDate,
    endDate: budget.endDate,
    isActive: budget.isActive,
    status: computeStatus(budget.isActive, percent),
    categoryId: budget.categoryId,
    categoryName: budget.category?.name ?? null,
    categoryColor: budget.category?.color ?? null,
    alert50: budget.alert50,
    alert80: budget.alert80,
    alert100: budget.alert100,
  };
}

/** Calcule le montant dépensé rattaché à un budget (selon sa portée). */
async function computeSpent(budget: {
  userId: string;
  budgetType: BudgetType;
  categoryId: string | null;
  startDate: Date;
  endDate: Date;
}): Promise<number> {
  const where: Prisma.ExpenseWhereInput = {
    userId: budget.userId,
    date: { gte: budget.startDate, lte: budget.endDate },
  };
  // Un budget par catégorie ne compte que les dépenses de cette catégorie.
  if (budget.budgetType === "CATEGORY" && budget.categoryId) {
    where.categoryId = budget.categoryId;
  }
  const agg = await prisma.expense.aggregate({ _sum: { amount: true }, where });
  return toNumber(agg._sum.amount);
}

// ── Recalcul automatique ────────────────────────────────────────────────────

/** Recalcule et persiste `spentAmount`/`remainingAmount` d'un budget. */
async function persistUsage(budget: Budget): Promise<void> {
  const spent = await computeSpent(budget);
  const remaining = toNumber(budget.amount) - spent;
  await prisma.budget.update({
    where: { id: budget.id },
    data: { spentAmount: spent, remainingAmount: remaining },
  });
}

/**
 * Recalcule tous les budgets actifs d'un utilisateur.
 * Appelé après chaque ajout / modification / suppression de dépense.
 */
export async function recalculateUserBudgets(userId: string): Promise<void> {
  const budgets = await prisma.budget.findMany({ where: { userId, isActive: true } });
  await Promise.all(budgets.map((b) => persistUsage(b)));
}

/** Recalcule la consommation d'un budget précis (et la persiste). */
export async function calculateBudgetUsage(
  userId: string,
  id: string,
): Promise<{ spent: number; remaining: number; percent: number }> {
  const budget = await prisma.budget.findFirst({ where: { id, userId } });
  if (!budget) throw new BudgetServiceError("Budget introuvable.");
  await persistUsage(budget);

  const amount = toNumber(budget.amount);
  const spent = await computeSpent(budget);
  return {
    spent,
    remaining: amount - spent,
    percent: amount > 0 ? Math.round((spent / amount) * 100) : 0,
  };
}

// ── Lecture ────────────────────────────────────────────────────────────────

/** Tous les budgets de l'utilisateur (actifs en premier, puis récents). */
export async function getBudgets(userId: string): Promise<BudgetView[]> {
  const budgets = await prisma.budget.findMany({
    where: { userId },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    include: { category: { select: { name: true, color: true } } },
  });
  return budgets.map(toView);
}

/** Un budget par id, uniquement s'il appartient à l'utilisateur. */
export async function getBudgetById(userId: string, id: string): Promise<BudgetView | null> {
  const budget = await prisma.budget.findFirst({
    where: { id, userId },
    include: { category: { select: { name: true, color: true } } },
  });
  return budget ? toView(budget) : null;
}

/** Statistiques globales des budgets actifs. */
export async function getBudgetStatistics(userId: string): Promise<BudgetStatistics> {
  const agg = await prisma.budget.aggregate({
    where: { userId, isActive: true },
    _sum: { amount: true, spentAmount: true },
    _avg: { amount: true },
    _count: true,
  });

  const totalBudget = toNumber(agg._sum.amount);
  const usedBudget = toNumber(agg._sum.spentAmount);

  return {
    totalBudget,
    usedBudget,
    remainingBudget: totalBudget - usedBudget,
    averageBudget: toNumber(agg._avg.amount),
    activeCount: agg._count,
  };
}

/** Données des graphiques de budgets. */
export async function getBudgetCharts(userId: string): Promise<BudgetCharts> {
  const now = new Date();
  const since = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const [budgets, monthlyRows] = await Promise.all([
    prisma.budget.findMany({
      where: { userId, isActive: true },
      orderBy: { amount: "desc" },
      include: { category: { select: { color: true } } },
    }),
    prisma.$queryRaw<{ ym: string; total: number }[]>(Prisma.sql`
      SELECT to_char(date_trunc('month', "date"), 'YYYY-MM') AS ym,
             COALESCE(SUM("amount"), 0)::float8 AS total
      FROM "expense"
      WHERE "userId" = ${userId} AND "date" >= ${since}
      GROUP BY 1
    `),
  ]);

  const distribution: CategorySlice[] = budgets.map((b, i) => ({
    name: b.name,
    color: b.category?.color ?? PALETTE[i % PALETTE.length],
    value: toNumber(b.amount),
  }));

  const progress: BudgetProgressPoint[] = budgets.slice(0, 8).map((b) => ({
    name: b.name,
    amount: toNumber(b.amount),
    spent: toNumber(b.spentAmount),
  }));

  const byKey = new Map(monthlyRows.map((r) => [r.ym, Number(r.total)]));
  const monthlyConsumption: MonthlyPoint[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyConsumption.push({ key, label: MONTH_LABELS[d.getMonth()], value: byKey.get(key) ?? 0 });
  }

  return { distribution, monthlyConsumption, progress };
}

// ── Écriture ─────────────────────────────────────────────────────────────

/** Empêche deux budgets globaux actifs sur des périodes qui se chevauchent. */
async function assertNoGlobalOverlap(
  userId: string,
  data: { budgetType: BudgetType; isActive: boolean; startDate: Date; endDate: Date },
  excludeId?: string,
): Promise<void> {
  if (data.budgetType !== "GLOBAL" || !data.isActive) return;

  const overlap = await prisma.budget.findFirst({
    where: {
      userId,
      budgetType: "GLOBAL",
      isActive: true,
      id: excludeId ? { not: excludeId } : undefined,
      startDate: { lte: data.endDate },
      endDate: { gte: data.startDate },
    },
    select: { id: true },
  });

  if (overlap) {
    throw new BudgetServiceError(
      "Un budget global actif existe déjà sur une période qui se chevauche.",
    );
  }
}

/** Prépare les champs persistés à partir des valeurs du formulaire. */
function normalize(data: BudgetFormValues) {
  return {
    name: data.name,
    description: data.description?.trim() ? data.description.trim() : null,
    amount: data.amount,
    budgetType: data.budgetType,
    period: data.period,
    startDate: parseDate(data.startDate),
    endDate: parseDate(data.endDate),
    categoryId: data.budgetType === "CATEGORY" ? data.categoryId || null : null,
    isActive: data.isActive,
    alert50: data.alert50,
    alert80: data.alert80,
    alert100: data.alert100,
  };
}

/** Vérifie qu'une catégorie choisie appartient à l'utilisateur (ou système). */
async function assertBudgetCategory(userId: string, categoryId: string): Promise<void> {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category || (category.userId !== null && category.userId !== userId)) {
    throw new BudgetServiceError("Catégorie introuvable.");
  }
}

/** Crée un budget puis calcule sa consommation initiale. */
export async function createBudget(userId: string, data: BudgetFormValues): Promise<BudgetView> {
  const fields = normalize(data);
  if (fields.budgetType === "CATEGORY" && fields.categoryId) {
    await assertBudgetCategory(userId, fields.categoryId);
  }
  await assertNoGlobalOverlap(userId, fields);

  const created = await prisma.budget.create({ data: { ...fields, userId } });
  await persistUsage(created);

  const view = await getBudgetById(userId, created.id);
  return view!;
}

/** Modifie un budget puis recalcule sa consommation. */
export async function updateBudget(
  userId: string,
  id: string,
  data: BudgetFormValues,
): Promise<BudgetView> {
  const existing = await prisma.budget.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw new BudgetServiceError("Budget introuvable.");

  const fields = normalize(data);
  if (fields.budgetType === "CATEGORY" && fields.categoryId) {
    await assertBudgetCategory(userId, fields.categoryId);
  }
  await assertNoGlobalOverlap(userId, fields, id);

  const updated = await prisma.budget.update({ where: { id }, data: fields });
  await persistUsage(updated);

  const view = await getBudgetById(userId, id);
  return view!;
}

/** Supprime un budget. */
export async function deleteBudget(userId: string, id: string): Promise<void> {
  const existing = await prisma.budget.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw new BudgetServiceError("Budget introuvable.");
  await prisma.budget.delete({ where: { id } });
}
