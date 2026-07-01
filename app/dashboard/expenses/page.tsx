import type { Metadata } from "next";
import type { PaymentMethod } from "@prisma/client";

import { requireAuth } from "@/lib/auth/server";
import { getExpenseCategories } from "@/services/categories/categories.service";
import {
  getExpenses,
  getExpenseCharts,
  getExpenseStatistics,
  type ExpenseListParams,
  type ExpenseSort,
  type SortOrder,
} from "@/services/expenses/expense.service";
import { ExpenseClient } from "@/components/expenses/expense-client";

export const metadata: Metadata = {
  title: "Dépenses",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const PAYMENT_METHOD_VALUES: PaymentMethod[] = [
  "CASH",
  "CARD",
  "TRANSFER",
  "MOBILE_MONEY",
  "CHEQUE",
  "OTHER",
];

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

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

/** Page Dépenses (Server Component) : filtres URL → données parallélisées. */
export default async function ExpensesPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireAuth();
  const sp = await searchParams;

  const sortParam = one(sp.sort);
  const sort: ExpenseSort = ["date", "amount", "title", "category"].includes(sortParam ?? "")
    ? (sortParam as ExpenseSort)
    : "date";
  const order: SortOrder = one(sp.order) === "asc" ? "asc" : "desc";
  const { from, to } = resolvePeriod(one(sp.period));
  const min = one(sp.min);
  const max = one(sp.max);
  const paymentParam = one(sp.payment) as PaymentMethod | undefined;
  const paymentMethod =
    paymentParam && PAYMENT_METHOD_VALUES.includes(paymentParam) ? paymentParam : undefined;

  const params: ExpenseListParams = {
    search: one(sp.q),
    categoryId: one(sp.category),
    paymentMethod,
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
    getExpenses(user.id, params),
    getExpenseStatistics(user.id),
    getExpenseCharts(user.id),
    getExpenseCategories(user.id),
  ]);

  const formCategories = categories.map((c) => ({ id: c.id, name: c.name, color: c.color }));

  return (
    <ExpenseClient
      result={result}
      stats={stats}
      charts={charts}
      categories={formCategories}
      currency={user.currency ?? "XOF"}
    />
  );
}
