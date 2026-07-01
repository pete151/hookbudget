import type { Metadata } from "next";
import { TrendingUp, TrendingDown, Scale, PiggyBank, Target, Wallet } from "lucide-react";

import { requireAuth } from "@/lib/auth/server";
import { getDashboardData, type MonthlyPoint } from "@/services/dashboard/dashboard.service";
import { formatCurrency } from "@/lib/utils/format";
import type { StatCardData, Trend } from "@/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardGrid } from "@/components/dashboard/dashboard-grid";
import { StatCard } from "@/components/dashboard/stat-card";
import { IncomeChart } from "@/components/dashboard/income-chart";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart";
import { BalanceChart } from "@/components/dashboard/balance-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { BudgetCard } from "@/components/dashboard/budget-card";
import { SavingGoalCard } from "@/components/dashboard/saving-goal-card";
import { EmptyState } from "@/components/dashboard/empty-state";

export const metadata: Metadata = {
  title: "Tableau de bord",
};

/** Variation mois courant vs mois précédent, à partir d'une série mensuelle. */
function changeFromSeries(series: MonthlyPoint[]): { change: string; trend: Trend } {
  const n = series.length;
  if (n < 2) return { change: "—", trend: "neutral" };
  const current = series[n - 1].value;
  const previous = series[n - 2].value;
  if (previous <= 0) return { change: "—", trend: "neutral" };
  const pct = ((current - previous) / previous) * 100;
  const trend: Trend = pct > 0 ? "up" : pct < 0 ? "down" : "neutral";
  return { change: `${pct > 0 ? "+" : ""}${pct.toFixed(1)} %`, trend };
}

export default async function DashboardPage() {
  const user = await requireAuth();
  const currency = user.currency ?? "XOF";
  const displayName = user.firstName?.trim() || user.name.split(" ")[0] || user.name;

  const data = await getDashboardData(user.id);
  const { summary } = data;

  const incomeChange = changeFromSeries(data.monthlyIncome);
  const expenseChange = changeFromSeries(data.monthlyExpenses);

  const stats: (StatCardData & { caption?: string })[] = [
    {
      id: "income",
      title: "Revenus du mois",
      value: formatCurrency(summary.monthIncome, currency),
      change: incomeChange.change,
      trend: incomeChange.trend,
      icon: TrendingUp,
    },
    {
      id: "expense",
      title: "Dépenses du mois",
      value: formatCurrency(summary.monthExpense, currency),
      change: expenseChange.change,
      trend: expenseChange.trend,
      icon: TrendingDown,
    },
    {
      id: "balance",
      title: "Solde actuel",
      value: formatCurrency(summary.balance, currency),
      change: "—",
      trend: "neutral",
      icon: Scale,
      caption: "net cumulé",
    },
    {
      id: "savings",
      title: "Épargne totale",
      value: formatCurrency(summary.totalSavings, currency),
      change: "—",
      trend: "neutral",
      icon: PiggyBank,
      caption: "objectifs",
    },
  ];

  return (
    <div className="space-y-6">
      <DashboardHeader name={displayName} />

      {/* Cartes statistiques */}
      <DashboardGrid columns={4}>
        {stats.map(({ id, caption, ...stat }) => (
          <StatCard key={id} id={id} {...stat} caption={caption} />
        ))}
      </DashboardGrid>

      {/* Graphiques */}
      <div className="grid gap-4 lg:grid-cols-2">
        <IncomeChart data={data.monthlyIncome} currency={currency} />
        <ExpenseChart data={data.monthlyExpenses} currency={currency} />
        <BalanceChart data={data.monthlyComparison} currency={currency} />
        <CategoryPieChart data={data.expensesByCategory} currency={currency} />
      </div>

      {/* Transactions + objectifs/budgets */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTransactions transactions={data.recentTransactions} currency={currency} />
        </div>

        <div className="flex flex-col gap-4">
          {/* Mes Objectifs */}
          <Card>
            <CardHeader>
              <CardTitle>Mes Objectifs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.savingGoals.length === 0 ? (
                <EmptyState
                  icon={Target}
                  title="Aucun objectif"
                  description="Fixez un objectif d'épargne pour suivre votre progression."
                  actionLabel="Créer votre premier objectif"
                  actionHref="/dashboard/savings/new"
                />
              ) : (
                data.savingGoals.map((goal) => (
                  <SavingGoalCard key={goal.id} goal={goal} currency={currency} />
                ))
              )}
            </CardContent>
          </Card>

          {/* Mes Budgets */}
          <Card>
            <CardHeader>
              <CardTitle>Mes Budgets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.budgets.length === 0 ? (
                <EmptyState
                  icon={Wallet}
                  title="Aucun budget"
                  description="Définissez un budget mensuel pour maîtriser vos dépenses."
                  actionLabel="Créer votre premier budget"
                  actionHref="/dashboard/budgets/new"
                />
              ) : (
                data.budgets.map((budget) => (
                  <BudgetCard key={budget.id} budget={budget} currency={currency} />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
