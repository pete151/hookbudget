"use client";

import { LineChart as LineChartIcon, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartCard, chartTooltipStyle } from "@/components/dashboard/chart-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { formatCurrency } from "@/lib/utils/format";
import type { SavingCharts } from "@/services/savings/saving.service";

const compact = (v: number) => new Intl.NumberFormat("fr-FR", { notation: "compact" }).format(v);

/** Trois graphiques d'épargne : progression, contributions, répartition. */
export function SavingGoalChart({ charts, currency }: { charts: SavingCharts; currency: string }) {
  const hasProgress = charts.monthlyProgress.some((d) => d.value > 0);
  const hasContrib = charts.monthlyContributions.some((d) => d.value > 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Progression mensuelle (cumulée) */}
      <ChartCard title="Progression mensuelle" description="Épargne cumulée (12 mois)">
        {hasProgress ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={charts.monthlyProgress}
              margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
            >
              <defs>
                <linearGradient id="savingProgress" x1="0" y1="0" x2="0" y2="1">
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
                tickFormatter={compact}
              />
              <Tooltip
                {...chartTooltipStyle}
                formatter={(value) => [formatCurrency(Number(value), currency), "Épargne"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#savingProgress)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState icon={LineChartIcon} title="Pas encore de données" className="h-[260px]" />
        )}
      </ChartCard>

      {/* Contributions mensuelles */}
      <ChartCard title="Contributions mensuelles" description="12 derniers mois">
        {hasContrib ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={charts.monthlyContributions}
              margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
            >
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
                tickFormatter={compact}
              />
              <Tooltip
                {...chartTooltipStyle}
                formatter={(value) => [formatCurrency(Number(value), currency), "Contributions"]}
              />
              <Bar dataKey="value" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState icon={BarChart3} title="Aucune contribution" className="h-[260px]" />
        )}
      </ChartCard>

      {/* Répartition des objectifs */}
      <ChartCard title="Répartition des objectifs" description="Par montant cible">
        {charts.distribution.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={charts.distribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
                stroke="var(--background)"
              >
                {charts.distribution.map((slice) => (
                  <Cell key={slice.name} fill={slice.color} />
                ))}
              </Pie>
              <Tooltip
                {...chartTooltipStyle}
                formatter={(value, name) => [formatCurrency(Number(value), currency), String(name)]}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: "12px", color: "var(--muted-foreground)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState icon={PieChartIcon} title="Aucun objectif" className="h-[260px]" />
        )}
      </ChartCard>
    </div>
  );
}
