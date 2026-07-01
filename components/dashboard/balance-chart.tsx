"use client";

import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartCard, chartTooltipStyle } from "@/components/dashboard/chart-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { formatCurrency } from "@/lib/utils/format";
import type { MonthlyComparisonPoint } from "@/services/dashboard/dashboard.service";

/** Histogramme comparatif Revenus vs Dépenses (12 derniers mois). */
export function BalanceChart({
  data,
  currency,
}: {
  data: MonthlyComparisonPoint[];
  currency: string;
}) {
  const hasData = data.some((d) => d.income > 0 || d.expense > 0);

  return (
    <ChartCard title="Revenus vs Dépenses" description="12 derniers mois">
      {hasData ? (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              stroke="var(--muted-foreground)"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={11}
              stroke="var(--muted-foreground)"
              width={48}
              tickFormatter={(v: number) =>
                new Intl.NumberFormat("fr-FR", { notation: "compact" }).format(v)
              }
            />
            <Tooltip
              {...chartTooltipStyle}
              formatter={(value, name) => [
                formatCurrency(Number(value), currency),
                name === "income" ? "Revenus" : "Dépenses",
              ]}
            />
            <Legend
              formatter={(value) => (value === "income" ? "Revenus" : "Dépenses")}
              wrapperStyle={{ fontSize: "12px" }}
            />
            <Bar dataKey="income" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <EmptyState
          icon={BarChart3}
          title="Pas encore de données"
          description="Le comparatif s'affichera avec vos premiers mouvements."
          className="h-[260px]"
        />
      )}
    </ChartCard>
  );
}
