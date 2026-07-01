import type { Metadata } from "next";

import { requireAuth } from "@/lib/auth/server";
import { getExpenseCategories } from "@/services/categories/categories.service";
import {
  getBudgets,
  getBudgetCharts,
  getBudgetStatistics,
} from "@/services/budgets/budget.service";
import { BudgetsClient } from "@/components/budgets/budgets-client";

export const metadata: Metadata = {
  title: "Budgets",
};

/** Page Budgets (Server Component) : liste, stats et graphiques parallélisés. */
export default async function BudgetsPage() {
  const user = await requireAuth();

  const [budgets, stats, charts, categories] = await Promise.all([
    getBudgets(user.id),
    getBudgetStatistics(user.id),
    getBudgetCharts(user.id),
    getExpenseCategories(user.id),
  ]);

  const formCategories = categories.map((c) => ({ id: c.id, name: c.name, color: c.color }));

  return (
    <BudgetsClient
      budgets={budgets}
      stats={stats}
      charts={charts}
      categories={formCategories}
      currency={user.currency ?? "XOF"}
    />
  );
}
