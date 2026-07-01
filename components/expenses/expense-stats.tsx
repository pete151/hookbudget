import { CalendarDays, CalendarRange, Divide, Flame, Hash } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrency } from "@/lib/utils/format";
import type { StatCardData } from "@/types";
import type { ExpenseStatistics } from "@/services/expenses/expense.service";

/** Section de statistiques des dépenses (5 cartes). */
export function ExpenseStats({ stats, currency }: { stats: ExpenseStatistics; currency: string }) {
  const cards: (StatCardData & { subtitle: string })[] = [
    {
      id: "month",
      title: "Dépenses du mois",
      value: formatCurrency(stats.monthTotal, currency),
      change: "",
      trend: "neutral",
      icon: CalendarDays,
      subtitle: "Mois en cours",
    },
    {
      id: "year",
      title: "Dépenses annuelles",
      value: formatCurrency(stats.yearTotal, currency),
      change: "",
      trend: "neutral",
      icon: CalendarRange,
      subtitle: "Année en cours",
    },
    {
      id: "average",
      title: "Dépense moyenne",
      value: formatCurrency(stats.average, currency),
      change: "",
      trend: "neutral",
      icon: Divide,
      subtitle: "Par dépense",
    },
    {
      id: "largest",
      title: "Plus grosse dépense",
      value: formatCurrency(stats.largest, currency),
      change: "",
      trend: "neutral",
      icon: Flame,
      subtitle: "Record",
    },
    {
      id: "count",
      title: "Nombre de dépenses",
      value: String(stats.count),
      change: "",
      trend: "neutral",
      icon: Hash,
      subtitle: "Au total",
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
