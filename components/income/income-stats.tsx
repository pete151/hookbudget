import { CalendarDays, CalendarRange, Divide, Trophy, Hash } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrency } from "@/lib/utils/format";
import type { StatCardData } from "@/types";
import type { IncomeStatistics } from "@/services/income/income.service";

/** Section de statistiques des revenus (5 cartes). */
export function IncomeStats({ stats, currency }: { stats: IncomeStatistics; currency: string }) {
  const cards: (StatCardData & { subtitle: string })[] = [
    {
      id: "month",
      title: "Revenus du mois",
      value: formatCurrency(stats.monthTotal, currency),
      change: "",
      trend: "neutral",
      icon: CalendarDays,
      subtitle: "Mois en cours",
    },
    {
      id: "year",
      title: "Revenus de l'année",
      value: formatCurrency(stats.yearTotal, currency),
      change: "",
      trend: "neutral",
      icon: CalendarRange,
      subtitle: "Année en cours",
    },
    {
      id: "average",
      title: "Revenu moyen",
      value: formatCurrency(stats.average, currency),
      change: "",
      trend: "neutral",
      icon: Divide,
      subtitle: "Par revenu",
    },
    {
      id: "largest",
      title: "Plus grosse rentrée",
      value: formatCurrency(stats.largest, currency),
      change: "",
      trend: "neutral",
      icon: Trophy,
      subtitle: "Record",
    },
    {
      id: "count",
      title: "Nombre de revenus",
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
