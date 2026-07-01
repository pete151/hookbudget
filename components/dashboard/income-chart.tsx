"use client";

import { TrendingUp } from "lucide-react";
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

/** Courbe des revenus sur les 12 derniers mois. */
export function IncomeChart({ data, currency }: { data: MonthlyPoint[]; currency: string }) {
  const hasData = data.some((d) => d.value > 0);

  return (
    <ChartCard title="Revenus" description="12 derniers mois">
      {hasData ? (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
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
              formatter={(value) => [formatCurrency(Number(value), currency), "Revenus"]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#incomeGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <EmptyState
          icon={TrendingUp}
          title="Aucun revenu"
          description="Ajoutez un revenu pour visualiser la courbe."
          className="h-[260px]"
        />
      )}
    </ChartCard>
  );
}
