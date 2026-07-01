import { PiggyBank, Target, CheckCircle2, Activity, Divide } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrency } from "@/lib/utils/format";
import type { StatCardData } from "@/types";
import type { SavingsStatistics } from "@/services/savings/saving.service";

/** Section de statistiques des objectifs (5 cartes). */
export function SavingGoalStats({
  stats,
  currency,
}: {
  stats: SavingsStatistics;
  currency: string;
}) {
  const cards: (StatCardData & { subtitle: string })[] = [
    {
      id: "total",
      title: "Total épargné",
      value: formatCurrency(stats.totalSaved, currency),
      change: "",
      trend: "neutral",
      icon: PiggyBank,
      subtitle: "Tous objectifs",
    },
    {
      id: "count",
      title: "Objectifs",
      value: String(stats.goalCount),
      change: "",
      trend: "neutral",
      icon: Target,
      subtitle: "Au total",
    },
    {
      id: "completed",
      title: "Objectifs atteints",
      value: String(stats.completedCount),
      change: "",
      trend: "neutral",
      icon: CheckCircle2,
      subtitle: "Complétés",
    },
    {
      id: "active",
      title: "Objectifs actifs",
      value: String(stats.activeCount),
      change: "",
      trend: "neutral",
      icon: Activity,
      subtitle: "En cours",
    },
    {
      id: "average",
      title: "Épargne moyenne",
      value: formatCurrency(stats.average, currency),
      change: "",
      trend: "neutral",
      icon: Divide,
      subtitle: "Par objectif",
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
