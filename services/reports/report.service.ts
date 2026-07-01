import "server-only";

import { Prisma, type ReportType, type ReportFormat } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { getBudgets } from "@/services/budgets/budget.service";
import { getSavingGoals } from "@/services/savings/saving.service";
import {
  computeSummary,
  monthBuckets,
  buildMonthly,
  buildCashFlow,
  withPercent,
} from "@/domain/reports/analytics";
import type {
  BudgetLine,
  CashFlowPoint,
  CategoryLine,
  MonthlyComparisonLine,
  ReportData,
  ReportFilters,
  ReportKind,
  ReportSummary,
  SavingLine,
  TransactionLine,
} from "@/domain/reports/types";

/**
 * Couche de services des rapports : charge les données (Prisma) et délègue les
 * calculs à `domain/reports`. Toutes les requêtes filtrent sur `userId`.
 */

function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : value.toNumber();
}

function bounds(filters: ReportFilters): { from: Date; to: Date } {
  const from = new Date(filters.from);
  const to = new Date(filters.to);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

function amountFragment(f: ReportFilters): Prisma.Sql {
  const parts: Prisma.Sql[] = [];
  if (f.categoryId) parts.push(Prisma.sql`AND "categoryId" = ${f.categoryId}`);
  if (f.minAmount != null) parts.push(Prisma.sql`AND "amount" >= ${f.minAmount}`);
  if (f.maxAmount != null) parts.push(Prisma.sql`AND "amount" <= ${f.maxAmount}`);
  return parts.length ? Prisma.join(parts, " ") : Prisma.empty;
}

/** Sommes mensuelles (par clé YYYY-MM) pour une table de mouvements. */
async function monthlyByKey(
  table: "income" | "expense",
  userId: string,
  from: Date,
  to: Date,
  f: ReportFilters,
): Promise<Map<string, number>> {
  const tableId = Prisma.raw(`"${table}"`);
  const rows = await prisma.$queryRaw<{ ym: string; total: number }[]>(Prisma.sql`
    SELECT to_char(date_trunc('month', "date"), 'YYYY-MM') AS ym,
           COALESCE(SUM("amount"), 0)::float8 AS total
    FROM ${tableId}
    WHERE "userId" = ${userId} AND "date" >= ${from} AND "date" <= ${to} ${amountFragment(f)}
    GROUP BY 1
  `);
  return new Map(rows.map((r) => [r.ym, Number(r.total)]));
}

function whereFor(
  userId: string,
  from: Date,
  to: Date,
  f: ReportFilters,
): Prisma.ExpenseWhereInput & Prisma.IncomeWhereInput {
  const where: Prisma.ExpenseWhereInput & Prisma.IncomeWhereInput = {
    userId,
    date: { gte: from, lte: to },
  };
  if (f.categoryId) where.categoryId = f.categoryId;
  if (f.minAmount != null || f.maxAmount != null) {
    const amount: Prisma.DecimalFilter = {};
    if (f.minAmount != null) amount.gte = f.minAmount;
    if (f.maxAmount != null) amount.lte = f.maxAmount;
    where.amount = amount;
  }
  return where;
}

// ── Sections ────────────────────────────────────────────────────────────────

/** Résumé financier (revenus, dépenses, solde, épargne). */
export async function getFinancialSummary(
  userId: string,
  f: ReportFilters,
): Promise<ReportSummary> {
  const { from, to } = bounds(f);
  const where = whereFor(userId, from, to, f);

  const [incomeAgg, expenseAgg, savingAgg] = await Promise.all([
    prisma.income.aggregate({ _sum: { amount: true }, where }),
    prisma.expense.aggregate({ _sum: { amount: true }, where }),
    prisma.savingContribution.aggregate({
      _sum: { amount: true },
      where: { savingGoal: { userId }, contributionDate: { gte: from, lte: to } },
    }),
  ]);

  return computeSummary(
    toNumber(incomeAgg._sum.amount),
    toNumber(expenseAgg._sum.amount),
    toNumber(savingAgg._sum.amount),
  );
}

/** Comparaison mensuelle revenus vs dépenses. */
export async function getMonthlyComparison(
  userId: string,
  f: ReportFilters,
): Promise<MonthlyComparisonLine[]> {
  const { from, to } = bounds(f);
  const [incomeByKey, expenseByKey] = await Promise.all([
    monthlyByKey("income", userId, from, to, f),
    monthlyByKey("expense", userId, from, to, f),
  ]);
  return buildMonthly(monthBuckets(from, to), incomeByKey, expenseByKey);
}

/** Flux de trésorerie mensuel. */
export async function getCashFlow(userId: string, f: ReportFilters): Promise<CashFlowPoint[]> {
  return buildCashFlow(await getMonthlyComparison(userId, f));
}

/** Répartition par catégorie d'une table (revenus ou dépenses). */
async function categoryBreakdown(
  table: "income" | "expense",
  userId: string,
  from: Date,
  to: Date,
  f: ReportFilters,
): Promise<CategoryLine[]> {
  const where = whereFor(userId, from, to, f);
  const grouped =
    table === "income"
      ? await prisma.income.groupBy({ by: ["categoryId"], _sum: { amount: true }, where })
      : await prisma.expense.groupBy({ by: ["categoryId"], _sum: { amount: true }, where });
  if (grouped.length === 0) return [];

  const ids = grouped.map((g) => g.categoryId).filter((id): id is string => id !== null);
  const categories = await prisma.category.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, color: true },
  });
  const byId = new Map(categories.map((c) => [c.id, c]));

  return withPercent(
    grouped.map((g) => {
      const cat = g.categoryId ? byId.get(g.categoryId) : undefined;
      return {
        name: cat?.name ?? "Autre",
        color: cat?.color ?? "#94a3b8",
        value: toNumber(g._sum.amount),
      };
    }),
  );
}

/** Rapport par catégorie (revenus + dépenses). */
export async function getCategoryReport(
  userId: string,
  f: ReportFilters,
): Promise<{ income: CategoryLine[]; expense: CategoryLine[] }> {
  const { from, to } = bounds(f);
  const [income, expense] = await Promise.all([
    categoryBreakdown("income", userId, from, to, f),
    categoryBreakdown("expense", userId, from, to, f),
  ]);
  return { income, expense };
}

/** Rapport des revenus (total + catégories). */
export async function getIncomeReport(
  userId: string,
  f: ReportFilters,
): Promise<{ total: number; byCategory: CategoryLine[] }> {
  const { from, to } = bounds(f);
  const where = whereFor(userId, from, to, f);
  const [agg, byCategory] = await Promise.all([
    prisma.income.aggregate({ _sum: { amount: true }, where }),
    categoryBreakdown("income", userId, from, to, f),
  ]);
  return { total: toNumber(agg._sum.amount), byCategory };
}

/** Rapport des dépenses (total + catégories). */
export async function getExpenseReport(
  userId: string,
  f: ReportFilters,
): Promise<{ total: number; byCategory: CategoryLine[] }> {
  const { from, to } = bounds(f);
  const where = whereFor(userId, from, to, f);
  const [agg, byCategory] = await Promise.all([
    prisma.expense.aggregate({ _sum: { amount: true }, where }),
    categoryBreakdown("expense", userId, from, to, f),
  ]);
  return { total: toNumber(agg._sum.amount), byCategory };
}

/** Rapport des budgets (état courant). */
export async function getBudgetReport(userId: string): Promise<BudgetLine[]> {
  const budgets = await getBudgets(userId);
  return budgets.map((b) => ({
    name: b.name,
    amount: b.amount,
    spent: b.spentAmount,
    remaining: b.remainingAmount,
    percent: b.percent,
  }));
}

/** Rapport des objectifs d'épargne (état courant). */
export async function getSavingReport(userId: string): Promise<SavingLine[]> {
  const goals = await getSavingGoals(userId);
  return goals.map((g) => ({
    name: g.name,
    target: g.targetAmount,
    current: g.currentAmount,
    percent: g.percent,
  }));
}

/** Transactions détaillées (revenus et/ou dépenses selon la portée). */
async function getTransactions(
  userId: string,
  from: Date,
  to: Date,
  f: ReportFilters,
): Promise<TransactionLine[]> {
  const where = whereFor(userId, from, to, f);
  const scope = f.transactionType ?? "all";
  const lines: TransactionLine[] = [];

  if (scope !== "expense") {
    const incomes = await prisma.income.findMany({
      where,
      orderBy: { date: "desc" },
      take: 500,
      include: { category: { select: { name: true } } },
    });
    for (const i of incomes) {
      lines.push({
        date: i.date.toISOString().slice(0, 10),
        title: i.title,
        type: "income",
        category: i.category?.name ?? "—",
        amount: toNumber(i.amount),
      });
    }
  }
  if (scope !== "income") {
    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
      take: 500,
      include: { category: { select: { name: true } } },
    });
    for (const e of expenses) {
      lines.push({
        date: e.date.toISOString().slice(0, 10),
        title: e.title,
        type: "expense",
        category: e.category?.name ?? "—",
        amount: toNumber(e.amount),
      });
    }
  }

  return lines.sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 500);
}

// ── Génération ──────────────────────────────────────────────────────────────

const TITLES: Record<ReportKind, string> = {
  SUMMARY: "Résumé financier",
  INCOME: "Rapport des revenus",
  EXPENSE: "Rapport des dépenses",
  CATEGORY: "Rapport par catégorie",
  BUDGET: "Rapport des budgets",
  SAVING: "Rapport des objectifs d'épargne",
  CASHFLOW: "Flux de trésorerie",
};

/** Assemble un rapport complet (toutes sections) pour un type et des filtres. */
export async function generateReport(
  userId: string,
  config: {
    type: ReportKind;
    filters: ReportFilters;
    user: { name: string; email: string };
    currency: string;
  },
): Promise<ReportData> {
  const { from, to } = bounds(config.filters);

  const [summary, monthly, category, budgets, savings, transactions] = await Promise.all([
    getFinancialSummary(userId, config.filters),
    getMonthlyComparison(userId, config.filters),
    getCategoryReport(userId, config.filters),
    getBudgetReport(userId),
    getSavingReport(userId),
    getTransactions(userId, from, to, config.filters),
  ]);

  const periodLabel = `${config.filters.from} → ${config.filters.to}`;

  return {
    meta: {
      type: config.type,
      title: TITLES[config.type],
      generatedAt: new Date().toISOString(),
      periodLabel,
      from: config.filters.from,
      to: config.filters.to,
      user: config.user,
      currency: config.currency,
    },
    summary,
    monthly,
    cashFlow: buildCashFlow(monthly),
    incomeByCategory: category.income,
    expenseByCategory: category.expense,
    budgets,
    savings,
    transactions,
  };
}

// ── Historique ──────────────────────────────────────────────────────────────

export interface ReportHistoryItem {
  id: string;
  title: string;
  type: ReportType;
  format: ReportFormat;
  periodStart: Date;
  periodEnd: Date;
  filters: ReportFilters | null;
  createdAt: Date;
}

/** Enregistre une entrée d'historique (rapport généré/exporté). */
export async function saveReportToHistory(
  userId: string,
  entry: { title: string; type: ReportType; format: ReportFormat; filters: ReportFilters },
): Promise<void> {
  await prisma.report.create({
    data: {
      userId,
      title: entry.title,
      type: entry.type,
      format: entry.format,
      periodStart: new Date(entry.filters.from),
      periodEnd: new Date(entry.filters.to),
      filters: entry.filters as unknown as Prisma.InputJsonValue,
    },
  });
}

/** Historique des rapports générés. */
export async function getReportHistory(userId: string): Promise<ReportHistoryItem[]> {
  const rows = await prisma.report.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    type: r.type,
    format: r.format,
    periodStart: r.periodStart,
    periodEnd: r.periodEnd,
    filters: (r.filters as unknown as ReportFilters) ?? null,
    createdAt: r.createdAt,
  }));
}

/** Supprime une entrée d'historique. */
export async function deleteReportFromHistory(userId: string, id: string): Promise<void> {
  await prisma.report.deleteMany({ where: { id, userId } });
}
