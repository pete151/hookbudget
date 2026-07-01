import { Wallet, TrendingDown, PiggyBank, Divide, LayoutList } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrency } from "@/lib/utils/format";
import type { StatCardData } from "@/types";
import type { BudgetStatistics } from "@/services/budgets/budget.service";

/** Section de statistiques des budgets (5 cartes). */
export function BudgetStats({ stats, currency }: { stats: BudgetStatistics; currency: string }) {
  const cards: (StatCardData & { subtitle: string })[] = [
    {
      id: "total",
      title: "Budget total",
      value: formatCurrency(stats.totalBudget, currency),
      change: "",
      trend: "neutral",
      icon: Wallet,
      subtitle: "Budgets actifs",
    },
    {
      id: "used",
      title: "Budget utilisé",
      value: formatCurrency(stats.usedBudget, currency),
      change: "",
      trend: "neutral",
      icon: TrendingDown,
      subtitle: "Consommé",
    },
    {
      id: "remaining",
      title: "Budget restant",
      value: formatCurrency(stats.remainingBudget, currency),
      change: "",
      trend: "neutral",
      icon: PiggyBank,
      subtitle: "Disponible",
    },
    {
      id: "average",
      title: "Budget moyen",
      value: formatCurrency(stats.averageBudget, currency),
      change: "",
      trend: "neutral",
      icon: Divide,
      subtitle: "Par budget",
    },
    {
      id: "count",
      title: "Budgets actifs",
      value: String(stats.activeCount),
      change: "",
      trend: "neutral",
      icon: LayoutList,
      subtitle: "En cours",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {cards.map(({ id, subtitle, ...card }) => (
        <StatCard key={id} id={id} {...card} hideChange subtitle={subtitle} />
      ))}
    </div>
  );
}
