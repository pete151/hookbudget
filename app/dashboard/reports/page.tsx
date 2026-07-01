import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, TrendingDown, Scale, PiggyBank, History, Plus } from "lucide-react";

import { requireAuth } from "@/lib/auth/server";
import { getFinancialSummary } from "@/services/reports/report.service";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { ReportCard } from "@/components/reports/report-card";
import { REPORT_TYPES, periodPresetBounds } from "@/lib/config/report-config";
import { formatCurrency } from "@/lib/utils/format";
import type { StatCardData } from "@/types";

export const metadata: Metadata = {
  title: "Rapports",
};

/** Page d'accueil des rapports : synthèse de l'année + accès rapides. */
export default async function ReportsPage() {
  const user = await requireAuth();
  const currency = user.currency ?? "XOF";

  const summary = await getFinancialSummary(user.id, {
    ...periodPresetBounds("this-year"),
    transactionType: "all",
  });

  const stats: StatCardData[] = [
    {
      id: "income",
      title: "Revenus (année)",
      value: formatCurrency(summary.income, currency),
      change: "",
      trend: "neutral",
      icon: TrendingUp,
    },
    {
      id: "expense",
      title: "Dépenses (année)",
      value: formatCurrency(summary.expense, currency),
      change: "",
      trend: "neutral",
      icon: TrendingDown,
    },
    {
      id: "balance",
      title: "Solde (année)",
      value: formatCurrency(summary.balance, currency),
      change: "",
      trend: "neutral",
      icon: Scale,
    },
    {
      id: "savings",
      title: "Épargne (année)",
      value: formatCurrency(summary.savings, currency),
      change: "",
      trend: "neutral",
      icon: PiggyBank,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Rapports</h1>
          <p className="text-muted-foreground text-sm">
            Générez, visualisez et exportez vos analyses financières.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/reports/history">
              <History className="h-4 w-4" />
              Historique
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/reports/new">
              <Plus className="h-4 w-4" />
              Nouveau rapport
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ id, ...s }) => (
          <StatCard key={id} id={id} {...s} hideChange subtitle="Année en cours" />
        ))}
      </div>

      <div>
        <h2 className="text-muted-foreground mb-3 text-sm font-medium">Créer un rapport</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {REPORT_TYPES.map((t) => (
            <ReportCard
              key={t.value}
              type={t.value}
              label={t.label}
              description={t.description}
              icon={t.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
