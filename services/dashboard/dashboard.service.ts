import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

/**
 * Couche de services du Dashboard — LECTURE SEULE.
 *
 * Toutes les fonctions sont paramétrées par `userId` et renvoient des données
 * **sérialisables** (les `Decimal` Prisma sont convertis en `number`) afin de
 * pouvoir être passées à des Server ou Client Components sans transformation.
 *
 * Performance : `getDashboardData()` regroupe l'ensemble des requêtes dans un
 * seul `Promise.all` (exécution parallèle) et mutualise les calculs — les
 * montants mensuels servent à la fois aux courbes, à l'histogramme et aux
 * cartes de synthèse.
 */

const MONTHS_WINDOW = 12;

/** Libellés courts des mois en français. */
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

// ──────────────────────────────────────────────────────────────────────────
// Types renvoyés
// ──────────────────────────────────────────────────────────────────────────

export interface MonthlyPoint {
  /** Clé technique `YYYY-MM`. */
  key: string;
  /** Libellé affiché (ex. « janv. »). */
  label: string;
  /** Montant du mois. */
  value: number;
}

export interface MonthlyComparisonPoint {
  key: string;
  label: string;
  income: number;
  expense: number;
}

export interface DashboardSummary {
  monthIncome: number;
  monthExpense: number;
  /** Solde net (tous revenus − toutes dépenses). */
  balance: number;
  /** Épargne totale (somme des `currentAmount` des objectifs). */
  totalSavings: number;
}

export interface CategorySlice {
  name: string;
  color: string;
  value: number;
}

export interface RecentTransaction {
  id: string;
  title: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  date: Date;
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
}

export interface SavingGoalView {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date | null;
  completed: boolean;
  /** Progression 0–100 (bornée). */
  percent: number;
}

export interface BudgetView {
  id: string;
  name: string;
  categoryName: string | null;
  amount: number;
  spent: number;
  remaining: number;
  /** Consommation 0–100 (bornée). */
  percent: number;
}

// ──────────────────────────────────────────────────────────────────────────
// Helpers internes
// ──────────────────────────────────────────────────────────────────────────

/** Convertit un `Decimal | null | undefined` en `number`. */
function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : value.toNumber();
}

/** Début du mois courant (00:00 le 1er). */
function startOfCurrentMonth(now = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/** Début du mois suivant (borne haute exclusive). */
function startOfNextMonth(now = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

/** Construit la liste des 12 derniers mois (du plus ancien au plus récent). */
function buildMonthWindow(now = new Date()): { key: string; label: string }[] {
  const result: { key: string; label: string }[] = [];
  for (let i = MONTHS_WINDOW - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    result.push({ key, label: MONTH_LABELS[d.getMonth()] });
  }
  return result;
}

/** Agrège des montants par mois via SQL et projette sur la fenêtre de 12 mois. */
async function monthlySeries(table: "expense" | "income", userId: string): Promise<MonthlyPoint[]> {
  const window = buildMonthWindow();
  const since = new Date(new Date().getFullYear(), new Date().getMonth() - (MONTHS_WINDOW - 1), 1);

  // Requête paramétrée et sûre : le nom de table provient d'un littéral typé,
  // jamais d'une entrée utilisateur.
  const tableId = Prisma.raw(`"${table}"`);
  const rows = await prisma.$queryRaw<{ ym: string; total: number }[]>(Prisma.sql`
    SELECT to_char(date_trunc('month', "date"), 'YYYY-MM') AS ym,
           COALESCE(SUM("amount"), 0)::float8 AS total
    FROM ${tableId}
    WHERE "userId" = ${userId} AND "date" >= ${since}
    GROUP BY 1
  `);

  const byKey = new Map(rows.map((r) => [r.ym, Number(r.total)]));
  return window.map((m) => ({ key: m.key, label: m.label, value: byKey.get(m.key) ?? 0 }));
}

// ──────────────────────────────────────────────────────────────────────────
// Fonctions publiques (spécifiées au Sprint 4)
// ──────────────────────────────────────────────────────────────────────────

/** Revenus mensuels sur les 12 derniers mois. */
export function getMonthlyIncome(userId: string): Promise<MonthlyPoint[]> {
  return monthlySeries("income", userId);
}

/** Dépenses mensuelles sur les 12 derniers mois. */
export function getMonthlyExpenses(userId: string): Promise<MonthlyPoint[]> {
  return monthlySeries("expense", userId);
}

/** Comparatif revenus / dépenses par mois (pour l'histogramme). */
export async function getMonthlyBalance(userId: string): Promise<MonthlyComparisonPoint[]> {
  const [income, expense] = await Promise.all([
    getMonthlyIncome(userId),
    getMonthlyExpenses(userId),
  ]);
  return mergeComparison(income, expense);
}

/** Fusionne deux séries mensuelles en points de comparaison. */
function mergeComparison(
  income: MonthlyPoint[],
  expense: MonthlyPoint[],
): MonthlyComparisonPoint[] {
  const expenseByKey = new Map(expense.map((p) => [p.key, p.value]));
  return income.map((p) => ({
    key: p.key,
    label: p.label,
    income: p.value,
    expense: expenseByKey.get(p.key) ?? 0,
  }));
}

/** Synthèse chiffrée (cartes du haut). */
export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const monthStart = startOfCurrentMonth();
  const monthEnd = startOfNextMonth();

  const [monthIncomeAgg, monthExpenseAgg, totalIncomeAgg, totalExpenseAgg, savingsAgg] =
    await Promise.all([
      prisma.income.aggregate({
        _sum: { amount: true },
        where: { userId, date: { gte: monthStart, lt: monthEnd } },
      }),
      prisma.expense.aggregate({
        _sum: { amount: true },
        where: { userId, date: { gte: monthStart, lt: monthEnd } },
      }),
      prisma.income.aggregate({ _sum: { amount: true }, where: { userId } }),
      prisma.expense.aggregate({ _sum: { amount: true }, where: { userId } }),
      prisma.savingGoal.aggregate({ _sum: { currentAmount: true }, where: { userId } }),
    ]);

  const totalIncome = toNumber(totalIncomeAgg._sum.amount);
  const totalExpense = toNumber(totalExpenseAgg._sum.amount);

  return {
    monthIncome: toNumber(monthIncomeAgg._sum.amount),
    monthExpense: toNumber(monthExpenseAgg._sum.amount),
    balance: totalIncome - totalExpense,
    totalSavings: toNumber(savingsAgg._sum.currentAmount),
  };
}

/** Répartition des dépenses par catégorie (diagramme circulaire). */
export async function getExpensesByCategory(userId: string): Promise<CategorySlice[]> {
  const grouped = await prisma.expense.groupBy({
    by: ["categoryId"],
    _sum: { amount: true },
    where: { userId },
  });
  if (grouped.length === 0) return [];

  const categoryIds = grouped.map((g) => g.categoryId).filter((id): id is string => id !== null);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true, color: true },
  });
  const catById = new Map(categories.map((c) => [c.id, c]));

  return grouped
    .map((g) => {
      const cat = g.categoryId ? catById.get(g.categoryId) : undefined;
      return {
        name: cat?.name ?? "Autre",
        color: cat?.color ?? "#94a3b8",
        value: toNumber(g._sum.amount),
      };
    })
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);
}

/** 10 dernières transactions (table générique). */
export async function getRecentTransactions(userId: string): Promise<RecentTransaction[]> {
  const rows = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 10,
    include: {
      expense: { select: { category: { select: { name: true, icon: true, color: true } } } },
      income: { select: { category: { select: { name: true, icon: true, color: true } } } },
    },
  });

  return rows.map((t) => {
    const category = t.expense?.category ?? t.income?.category ?? null;
    return {
      id: t.id,
      title: t.title,
      amount: toNumber(t.amount),
      type: t.type,
      date: t.date,
      categoryName: category?.name ?? null,
      categoryIcon: category?.icon ?? null,
      categoryColor: category?.color ?? null,
    };
  });
}

/** Top 5 objectifs d'épargne (section « Mes Objectifs » du dashboard). */
export async function getSavingGoals(userId: string): Promise<SavingGoalView[]> {
  const goals = await prisma.savingGoal.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 5,
  });

  return goals.map((g) => {
    const target = toNumber(g.targetAmount);
    const current = toNumber(g.currentAmount);
    const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    return {
      id: g.id,
      name: g.name,
      targetAmount: target,
      currentAmount: current,
      deadline: g.targetDate,
      completed: g.status === "COMPLETED",
      percent,
    };
  });
}

/** 5 budgets actifs principaux (section « Mes Budgets » du dashboard). */
export async function getBudgets(userId: string): Promise<BudgetView[]> {
  const budgets = await prisma.budget.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { category: { select: { name: true } } },
  });

  return budgets.map((b) => {
    const amount = toNumber(b.amount);
    const spent = toNumber(b.spentAmount);
    const remaining = amount - spent;
    const percent = amount > 0 ? Math.min(100, Math.round((spent / amount) * 100)) : 0;
    return {
      id: b.id,
      name: b.name,
      categoryName: b.category?.name ?? null,
      amount,
      spent,
      remaining,
      percent,
    };
  });
}

// ──────────────────────────────────────────────────────────────────────────
// Agrégateur — UNE seule entrée pour le Dashboard (requêtes parallélisées)
// ──────────────────────────────────────────────────────────────────────────

export interface DashboardData {
  summary: DashboardSummary;
  monthlyIncome: MonthlyPoint[];
  monthlyExpenses: MonthlyPoint[];
  monthlyComparison: MonthlyComparisonPoint[];
  expensesByCategory: CategorySlice[];
  recentTransactions: RecentTransaction[];
  savingGoals: SavingGoalView[];
  budgets: BudgetView[];
}

/**
 * Charge l'intégralité des données du Dashboard en parallèle.
 * Les séries mensuelles (revenus/dépenses) sont récupérées une seule fois puis
 * réutilisées pour l'histogramme comparatif (mutualisation des calculs).
 */
export async function getDashboardData(userId: string): Promise<DashboardData> {
  const [
    summary,
    monthlyIncome,
    monthlyExpenses,
    expensesByCategory,
    recentTransactions,
    savingGoals,
    budgets,
  ] = await Promise.all([
    getDashboardSummary(userId),
    getMonthlyIncome(userId),
    getMonthlyExpenses(userId),
    getExpensesByCategory(userId),
    getRecentTransactions(userId),
    getSavingGoals(userId),
    getBudgets(userId),
  ]);

  return {
    summary,
    monthlyIncome,
    monthlyExpenses,
    monthlyComparison: mergeComparison(monthlyIncome, monthlyExpenses),
    expensesByCategory,
    recentTransactions,
    savingGoals,
    budgets,
  };
}
