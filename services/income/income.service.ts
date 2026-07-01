import "server-only";

import { Prisma, TransactionType, type Income } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type { IncomeFormValues } from "@/lib/validations/income";
import type { MonthlyPoint, CategorySlice } from "@/services/dashboard/dashboard.service";

/**
 * Couche de services des revenus — toutes les requêtes filtrent sur `userId`.
 * Un revenu maintient en miroir une ligne `Transaction` (type INCOME) pour
 * alimenter le flux unifié du Dashboard.
 *
 * Ce module est volontairement modulaire pour servir de patron au module
 * Dépenses (Sprint 7).
 */

// ── Types ────────────────────────────────────────────────────────────────

export type IncomeSort = "date" | "amount" | "title";
export type SortOrder = "asc" | "desc";

export interface IncomeListParams {
  search?: string;
  categoryId?: string;
  from?: Date;
  to?: Date;
  minAmount?: number;
  maxAmount?: number;
  sort?: IncomeSort;
  order?: SortOrder;
  page?: number;
  pageSize?: number;
}

export interface IncomeListItem {
  id: string;
  title: string;
  amount: number;
  date: Date;
  description: string | null;
  source: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
}

export interface IncomeListResult {
  items: IncomeListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IncomeStatistics {
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

export interface IncomeCharts {
  monthly: MonthlyPoint[];
  byCategory: CategorySlice[];
  annual: AnnualPoint[];
}

export class IncomeServiceError extends Error {}

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

type IncomeWithCategory = Income & {
  category: { name: string; icon: string | null; color: string | null } | null;
};

function toListItem(income: IncomeWithCategory): IncomeListItem {
  return {
    id: income.id,
    title: income.title,
    amount: toNumber(income.amount),
    date: income.date,
    description: income.description,
    source: income.source,
    categoryId: income.categoryId,
    categoryName: income.category?.name ?? null,
    categoryIcon: income.category?.icon ?? null,
    categoryColor: income.category?.color ?? null,
  };
}

/**
 * Vérifie que la catégorie choisie est utilisable par l'utilisateur (la sienne
 * ou une catégorie système) ET qu'elle est bien de type revenu.
 */
async function assertIncomeCategory(userId: string, categoryId: string): Promise<void> {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category || (category.userId !== null && category.userId !== userId)) {
    throw new IncomeServiceError("Catégorie introuvable.");
  }
  if (category.type !== TransactionType.INCOME) {
    throw new IncomeServiceError("La catégorie doit être une catégorie de revenu.");
  }
}

// ── Lecture ────────────────────────────────────────────────────────────────

/** Liste paginée, filtrée et triée des revenus de l'utilisateur. */
export async function getIncome(
  userId: string,
  params: IncomeListParams = {},
): Promise<IncomeListResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE));
  const sort = params.sort ?? "date";
  const order = params.order ?? "desc";

  const where: Prisma.IncomeWhereInput = { userId };

  if (params.search?.trim()) {
    const q = params.search.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { source: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (params.categoryId) where.categoryId = params.categoryId;
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

  const [items, total] = await prisma.$transaction([
    prisma.income.findMany({
      where,
      orderBy: { [sort]: order },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: { select: { name: true, icon: true, color: true } } },
    }),
    prisma.income.count({ where }),
  ]);

  return {
    items: items.map(toListItem),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Un revenu par id, uniquement s'il appartient à l'utilisateur. */
export async function getIncomeById(userId: string, id: string): Promise<IncomeListItem | null> {
  const income = await prisma.income.findFirst({
    where: { id, userId },
    include: { category: { select: { name: true, icon: true, color: true } } },
  });
  return income ? toListItem(income) : null;
}

/** Synthèse chiffrée des revenus. */
export async function getIncomeStatistics(userId: string): Promise<IncomeStatistics> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearEnd = new Date(now.getFullYear() + 1, 0, 1);

  const [monthAgg, yearAgg, globalAgg] = await Promise.all([
    prisma.income.aggregate({
      _sum: { amount: true },
      where: { userId, date: { gte: monthStart, lt: monthEnd } },
    }),
    prisma.income.aggregate({
      _sum: { amount: true },
      where: { userId, date: { gte: yearStart, lt: yearEnd } },
    }),
    prisma.income.aggregate({
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

/** Revenus mensuels sur les 12 derniers mois (courbe). */
export async function getMonthlyIncome(userId: string): Promise<MonthlyPoint[]> {
  const now = new Date();
  const since = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const rows = await prisma.$queryRaw<{ ym: string; total: number }[]>(Prisma.sql`
    SELECT to_char(date_trunc('month', "date"), 'YYYY-MM') AS ym,
           COALESCE(SUM("amount"), 0)::float8 AS total
    FROM "income"
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

/** Répartition des revenus par catégorie (diagramme circulaire). */
export async function getIncomeByCategory(userId: string): Promise<CategorySlice[]> {
  const grouped = await prisma.income.groupBy({
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

/** Évolution annuelle des revenus (5 dernières années). */
export async function getAnnualIncome(userId: string): Promise<AnnualPoint[]> {
  const now = new Date();
  const since = new Date(now.getFullYear() - 4, 0, 1);

  const rows = await prisma.$queryRaw<{ yr: number; total: number }[]>(Prisma.sql`
    SELECT EXTRACT(YEAR FROM "date")::int AS yr,
           COALESCE(SUM("amount"), 0)::float8 AS total
    FROM "income"
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

/** Toutes les données de graphiques (une seule entrée parallélisée). */
export async function getIncomeCharts(userId: string): Promise<IncomeCharts> {
  const [monthly, byCategory, annual] = await Promise.all([
    getMonthlyIncome(userId),
    getIncomeByCategory(userId),
    getAnnualIncome(userId),
  ]);
  return { monthly, byCategory, annual };
}

// ── Écriture (maintient le miroir Transaction) ──────────────────────────────

function parseDate(value: string): Date {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new IncomeServiceError("Date invalide.");
  return d;
}

/** Crée un revenu (+ sa transaction miroir). */
export async function createIncome(
  userId: string,
  data: IncomeFormValues,
): Promise<IncomeListItem> {
  await assertIncomeCategory(userId, data.categoryId);
  const date = parseDate(data.date);
  const description = data.description?.trim() ? data.description.trim() : null;
  const source = data.source?.trim() ? data.source.trim() : null;

  const income = await prisma.$transaction(async (tx) => {
    const created = await tx.income.create({
      data: {
        title: data.title,
        amount: data.amount,
        date,
        description,
        source,
        userId,
        categoryId: data.categoryId,
      },
      include: { category: { select: { name: true, icon: true, color: true } } },
    });
    await tx.transaction.create({
      data: {
        amount: data.amount,
        type: TransactionType.INCOME,
        title: data.title,
        description,
        date,
        userId,
        incomeId: created.id,
      },
    });
    return created;
  });

  return toListItem(income);
}

/** Modifie un revenu (+ sa transaction miroir). */
export async function updateIncome(
  userId: string,
  id: string,
  data: IncomeFormValues,
): Promise<IncomeListItem> {
  const existing = await prisma.income.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw new IncomeServiceError("Revenu introuvable.");
  await assertIncomeCategory(userId, data.categoryId);

  const date = parseDate(data.date);
  const description = data.description?.trim() ? data.description.trim() : null;
  const source = data.source?.trim() ? data.source.trim() : null;

  const income = await prisma.$transaction(async (tx) => {
    const updated = await tx.income.update({
      where: { id },
      data: {
        title: data.title,
        amount: data.amount,
        date,
        description,
        source,
        categoryId: data.categoryId,
      },
      include: { category: { select: { name: true, icon: true, color: true } } },
    });
    await tx.transaction.updateMany({
      where: { incomeId: id },
      data: { amount: data.amount, title: data.title, description, date },
    });
    return updated;
  });

  return toListItem(income);
}

/** Supprime un revenu (la transaction miroir est supprimée en cascade). */
export async function deleteIncome(userId: string, id: string): Promise<void> {
  const existing = await prisma.income.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw new IncomeServiceError("Revenu introuvable.");
  await prisma.income.delete({ where: { id } });
}
