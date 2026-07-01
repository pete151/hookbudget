"use client";

import { TrendingDown } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartCard, chartTooltipStyle } from "@/components/dashboard/chart-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { formatCurrency } from "@/lib/utils/format";
import type { MonthlyPoint } from "@/services/dashboard/dashboard.service";

/** Courbe des dépenses sur les 12 derniers mois. */
export function ExpenseChart({ data, currency }: { data: MonthlyPoint[]; currency: string }) {
  const hasData = data.some((d) => d.value > 0);

  return (
    <ChartCard title="Dépenses" description="12 derniers mois">
      {hasData ? (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              formatter={(value) => [formatCurrency(Number(value), currency), "Dépenses"]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--chart-3)"
              strokeWidth={2}
              fill="url(#expenseGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <EmptyState
          icon={TrendingDown}
          title="Aucune dépense"
          description="Ajoutez une dépense pour visualiser la courbe."
          className="h-[260px]"
        />
      )}
    </ChartCard>
  );
}
