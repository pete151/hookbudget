import "server-only";

import {
  Prisma,
  TransactionType,
  type Expense,
  type PaymentMethod,
  type RecurrenceFrequency,
} from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type { ExpenseFormValues } from "@/lib/validations/expense";
import type { MonthlyPoint, CategorySlice } from "@/services/dashboard/dashboard.service";
import { PAYMENT_METHOD_COLORS, PAYMENT_METHOD_LABELS } from "@/lib/config/payment-methods";

/**
 * Couche de services des dépenses — parallèle au module Revenus.
 * Toutes les requêtes filtrent sur `userId`. Chaque dépense maintient une
 * `Transaction` miroir (type EXPENSE) pour le flux unifié du Dashboard.
 */

export type ExpenseSort = "date" | "amount" | "title" | "category";
export type SortOrder = "asc" | "desc";

export interface ExpenseListParams {
  search?: string;
  categoryId?: string;
  paymentMethod?: PaymentMethod;
  from?: Date;
  to?: Date;
  minAmount?: number;
  maxAmount?: number;
  sort?: ExpenseSort;
  order?: SortOrder;
  page?: number;
  pageSize?: number;
}

export interface ExpenseListItem {
  id: string;
  title: string;
  amount: number;
  date: Date;
  description: string | null;
  notes: string | null;
  paymentMethod: PaymentMethod;
  attachmentUrl: string | null;
  isRecurring: boolean;
  frequency: RecurrenceFrequency | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
}

export interface ExpenseListResult {
  items: ExpenseListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ExpenseStatistics {
  monthTotal: number;
  yearTotal: number;
  average: number;
  largest: number;
  count: number;
}

export interface AnnualPoint {
  year: number;
  value: number;
}

export interface ExpenseCharts {
  monthly: MonthlyPoint[];
  byCategory: CategorySlice[];
  byPaymentMethod: CategorySlice[];
  annual: AnnualPoint[];
}

export class ExpenseServiceError extends Error {}

const DEFAULT_PAGE_SIZE = 10;
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

type ExpenseWithCategory = Expense & {
  category: { name: string; icon: string | null; color: string | null } | null;
};

function toListItem(expense: ExpenseWithCategory): ExpenseListItem {
  return {
    id: expense.id,
    title: expense.title,
    amount: toNumber(expense.amount),
    date: expense.date,
    description: expense.description,
    notes: expense.notes,
    paymentMethod: expense.paymentMethod,
    attachmentUrl: expense.attachmentUrl,
    isRecurring: expense.isRecurring,
    frequency: expense.frequency,
    categoryId: expense.categoryId,
    categoryName: expense.category?.name ?? null,
    categoryIcon: expense.category?.icon ?? null,
    categoryColor: expense.category?.color ?? null,
  };
}

/** Vérifie que la catégorie appartient à l'utilisateur (ou système) ET est de type dépense. */
async function assertExpenseCategory(userId: string, categoryId: string): Promise<void> {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category || (category.userId !== null && category.userId !== userId)) {
    throw new ExpenseServiceError("Catégorie introuvable.");
  }
  if (category.type !== TransactionType.EXPENSE) {
    throw new ExpenseServiceError("La catégorie doit être une catégorie de dépense.");
  }
}

// ── Lecture ────────────────────────────────────────────────────────────────

/** Liste paginée, filtrée et triée des dépenses. */
export async function getExpenses(
  userId: string,
  params: ExpenseListParams = {},
): Promise<ExpenseListResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE));
  const sort = params.sort ?? "date";
  const order = params.order ?? "desc";

  const where: Prisma.ExpenseWhereInput = { userId };

  if (params.search?.trim()) {
    const q = params.search.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { notes: { contains: q, mode: "insensitive" } },
    ];
  }
  if (params.categoryId) where.categoryId = params.categoryId;
  if (params.paymentMethod) where.paymentMethod = params.paymentMethod;
  if (params.from || params.to) {
    const dateFilter: Prisma.DateTimeFilter = {};
    if (params.from) dateFilter.gte = params.from;
    if (params.to) dateFilter.lte = params.to;
    where.date = dateFilter;
  }
  if (params.minAmount != null || params.maxAmount != null) {
    const amountFilter: Prisma.DecimalFilter = {};
    if (params.minAmount != null) amountFilter.gte = params.minAmount;
    if (params.maxAmount != null) amountFilter.lte = params.maxAmount;
    where.amount = amountFilter;
  }

  // Tri par catégorie = tri sur le nom de la catégorie liée.
  const orderBy: Prisma.ExpenseOrderByWithRelationInput =
    sort === "category" ? { category: { name: order } } : { [sort]: order };

  const [items, total] = await prisma.$transaction([
    prisma.expense.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: { select: { name: true, icon: true, color: true } } },
    }),
    prisma.expense.count({ where }),
  ]);

  return {
    items: items.map(toListItem),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Une dépense par id, uniquement si elle appartient à l'utilisateur. */
export async function getExpenseById(userId: string, id: string): Promise<ExpenseListItem | null> {
  const expense = await prisma.expense.findFirst({
    where: { id, userId },
    include: { category: { select: { name: true, icon: true, color: true } } },
  });
  return expense ? toListItem(expense) : null;
}

/** Synthèse chiffrée des dépenses. */
export async function getExpenseStatistics(userId: string): Promise<ExpenseStatistics> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearEnd = new Date(now.getFullYear() + 1, 0, 1);

  const [monthAgg, yearAgg, globalAgg] = await Promise.all([
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { userId, date: { gte: monthStart, lt: monthEnd } },
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { userId, date: { gte: yearStart, lt: yearEnd } },
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
      _avg: { amount: true },
      _max: { amount: true },
      _count: true,
      where: { userId },
    }),
  ]);

  return {
    monthTotal: toNumber(monthAgg._sum.amount),
    yearTotal: toNumber(yearAgg._sum.amount),
    average: toNumber(globalAgg._avg.amount),
    largest: toNumber(globalAgg._max.amount),
    count: globalAgg._count,
  };
}

/** Dépenses mensuelles sur les 12 derniers mois. */
export async function getMonthlyExpenses(userId: string): Promise<MonthlyPoint[]> {
  const now = new Date();
  const since = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const rows = await prisma.$queryRaw<{ ym: string; total: number }[]>(Prisma.sql`
    SELECT to_char(date_trunc('month', "date"), 'YYYY-MM') AS ym,
           COALESCE(SUM("amount"), 0)::float8 AS total
    FROM "expense"
    WHERE "userId" = ${userId} AND "date" >= ${since}
    GROUP BY 1
  `);
  const byKey = new Map(rows.map((r) => [r.ym, Number(r.total)]));

  const result: MonthlyPoint[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    result.push({ key, label: MONTH_LABELS[d.getMonth()], value: byKey.get(key) ?? 0 });
  }
  return result;
}

/** Répartition des dépenses par catégorie. */
export async function getExpenseByCategory(userId: string): Promise<CategorySlice[]> {
  const grouped = await prisma.expense.groupBy({
    by: ["categoryId"],
    _sum: { amount: true },
    where: { userId },
  });
  if (grouped.length === 0) return [];

  const ids = grouped.map((g) => g.categoryId).filter((id): id is string => id !== null);
  const categories = await prisma.category.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, color: true },
  });
  const byId = new Map(categories.map((c) => [c.id, c]));

  return grouped
    .map((g) => {
      const cat = g.categoryId ? byId.get(g.categoryId) : undefined;
      return {
        name: cat?.name ?? "Autre",
        color: cat?.color ?? "#94a3b8",
        value: toNumber(g._sum.amount),
      };
    })
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);
}

/** Répartition des dépenses par mode de paiement. */
export async function getExpenseByPaymentMethod(userId: string): Promise<CategorySlice[]> {
  const grouped = await prisma.expense.groupBy({
    by: ["paymentMethod"],
    _sum: { amount: true },
    where: { userId },
  });

  return grouped
    .map((g) => ({
      name: PAYMENT_METHOD_LABELS[g.paymentMethod],
      color: PAYMENT_METHOD_COLORS[g.paymentMethod],
      value: toNumber(g._sum.amount),
    }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);
}

/** Évolution annuelle des dépenses (5 dernières années). */
export async function getAnnualExpenses(userId: string): Promise<AnnualPoint[]> {
  const now = new Date();
  const since = new Date(now.getFullYear() - 4, 0, 1);

  const rows = await prisma.$queryRaw<{ yr: number; total: number }[]>(Prisma.sql`
    SELECT EXTRACT(YEAR FROM "date")::int AS yr,
           COALESCE(SUM("amount"), 0)::float8 AS total
    FROM "expense"
    WHERE "userId" = ${userId} AND "date" >= ${since}
    GROUP BY 1
  `);
  const byYear = new Map(rows.map((r) => [Number(r.yr), Number(r.total)]));

  const result: AnnualPoint[] = [];
  for (let y = now.getFullYear() - 4; y <= now.getFullYear(); y++) {
    result.push({ year: y, value: byYear.get(y) ?? 0 });
  }
  return result;
}

/** Toutes les données de graphiques (parallélisées). */
export async function getExpenseCharts(userId: string): Promise<ExpenseCharts> {
  const [monthly, byCategory, byPaymentMethod, annual] = await Promise.all([
    getMonthlyExpenses(userId),
    getExpenseByCategory(userId),
    getExpenseByPaymentMethod(userId),
    getAnnualExpenses(userId),
  ]);
  return { monthly, byCategory, byPaymentMethod, annual };
}

// ── Écriture (maintient le miroir Transaction) ──────────────────────────────

function parseDate(value: string): Date {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new ExpenseServiceError("Date invalide.");
  return d;
}

function normalize(data: ExpenseFormValues) {
  return {
    title: data.title,
    amount: data.amount,
    date: parseDate(data.date),
    description: data.description?.trim() ? data.description.trim() : null,
    notes: data.notes?.trim() ? data.notes.trim() : null,
    attachmentUrl: data.attachmentUrl?.trim() ? data.attachmentUrl.trim() : null,
    paymentMethod: data.paymentMethod,
    isRecurring: data.isRecurring,
    frequency: data.isRecurring ? data.frequency : null,
    categoryId: data.categoryId,
  };
}

/** Crée une dépense (+ sa transaction miroir). */
export async function createExpense(
  userId: string,
  data: ExpenseFormValues,
): Promise<ExpenseListItem> {
  await assertExpenseCategory(userId, data.categoryId);
  const fields = normalize(data);

  const expense = await prisma.$transaction(async (tx) => {
    const created = await tx.expense.create({
      data: { ...fields, userId },
      include: { category: { select: { name: true, icon: true, color: true } } },
    });
    await tx.transaction.create({
      data: {
        amount: fields.amount,
        type: TransactionType.EXPENSE,
        title: fields.title,
        description: fields.description,
        date: fields.date,
        userId,
        expenseId: created.id,
      },
    });
    return created;
  });

  return toListItem(expense);
}

/** Modifie une dépense (+ sa transaction miroir). */
export async function updateExpense(
  userId: string,
  id: string,
  data: ExpenseFormValues,
): Promise<ExpenseListItem> {
  const existing = await prisma.expense.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw new ExpenseServiceError("Dépense introuvable.");
  await assertExpenseCategory(userId, data.categoryId);

  const fields = normalize(data);

  const expense = await prisma.$transaction(async (tx) => {
    const updated = await tx.expense.update({
      where: { id },
      data: fields,
      include: { category: { select: { name: true, icon: true, color: true } } },
    });
    await tx.transaction.updateMany({
      where: { expenseId: id },
      data: {
        amount: fields.amount,
        title: fields.title,
        description: fields.description,
        date: fields.date,
      },
    });
    return updated;
  });

  return toListItem(expense);
}

/** Supprime une dépense (la transaction miroir est supprimée en cascade). */
export async function deleteExpense(userId: string, id: string): Promise<void> {
  const existing = await prisma.expense.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw new ExpenseServiceError("Dépense introuvable.");
  await prisma.expense.delete({ where: { id } });
}
