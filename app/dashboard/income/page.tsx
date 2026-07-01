import type { Metadata } from "next";

import { requireAuth } from "@/lib/auth/server";
import { getIncomeCategories } from "@/services/categories/categories.service";
import {
  getIncome,
  getIncomeCharts,
  getIncomeStatistics,
  type IncomeListParams,
  type IncomeSort,
  type SortOrder,
} from "@/services/income/income.service";
import { IncomeClient } from "@/components/income/income-client";

export const metadata: Metadata = {
  title: "Revenus",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Première valeur d'un paramètre d'URL. */
function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Traduit un préréglage de période en bornes de dates. */
function resolvePeriod(period: string | undefined): { from?: Date; to?: Date } {
  const now = new Date();
  switch (period) {
    case "month":
      return { from: new Date(now.getFullYear(), now.getMonth(), 1) };
    case "year":
      return { from: new Date(now.getFullYear(), 0, 1) };
    case "30d":
      return { from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    default:
      return {};
  }
}

/**
 * Page Revenus (Server Component).
 * Lit les filtres depuis l'URL, charge en parallèle la liste paginée, les
 * statistiques, les graphiques et les catégories de revenu de l'utilisateur.
 */
export default async function IncomePage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireAuth();
  const sp = await searchParams;

  const sortParam = one(sp.sort);
  const sort: IncomeSort = ["date", "amount", "title"].includes(sortParam ?? "")
    ? (sortParam as IncomeSort)
    : "date";
  const order: SortOrder = one(sp.order) === "asc" ? "asc" : "desc";
  const { from, to } = resolvePeriod(one(sp.period));
  const min = one(sp.min);
  const max = one(sp.max);

  const params: IncomeListParams = {
    search: one(sp.q),
    categoryId: one(sp.category),
    from,
    to,
    minAmount: min ? Number(min) : undefined,
    maxAmount: max ? Number(max) : undefined,
    sort,
    order,
    page: Number(one(sp.page) ?? "1") || 1,
    pageSize: 10,
  };

  const [result, stats, charts, categories] = await Promise.all([
    getIncome(user.id, params),
    getIncomeStatistics(user.id),
    getIncomeCharts(user.id),
    getIncomeCategories(user.id),
  ]);

  const formCategories = categories.map((c) => ({ id: c.id, name: c.name, color: c.color }));

  return (
    <IncomeClient
      result={result}
      stats={stats}
      charts={charts}
      categories={formCategories}
      currency={user.currency ?? "XOF"}
    />
  );
}
