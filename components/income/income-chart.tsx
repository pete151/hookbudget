"use client";

import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from "lucide-react";
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
import type { AnnualPoint, IncomeCharts } from "@/services/income/income.service";

const compact = (v: number) => new Intl.NumberFormat("fr-FR", { notation: "compact" }).format(v);

/** Trois graphiques de revenus : courbe mensuelle, catégories, évolution annuelle. */
export function IncomeChart({ charts, currency }: { charts: IncomeCharts; currency: string }) {
  const hasMonthly = charts.monthly.some((d) => d.value > 0);
  const hasAnnual = charts.annual.some((d: AnnualPoint) => d.value > 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Courbe mensuelle */}
      <ChartCard title="Revenus mensuels" description="12 derniers mois">
        {hasMonthly ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={charts.monthly} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeMonthly" x1="0" y1="0" x2="0" y2="1">
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
                formatter={(value) => [formatCurrency(Number(value), currency), "Revenus"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#incomeMonthly)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState icon={TrendingUp} title="Pas encore de données" className="h-[260px]" />
        )}
      </ChartCard>

      {/* Répartition par catégorie */}
      <ChartCard title="Revenus par catégorie" description="Toutes périodes">
        {charts.byCategory.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={charts.byCategory}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
                stroke="var(--background)"
              >
                {charts.byCategory.map((slice) => (
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
          <EmptyState icon={PieChartIcon} title="Aucune donnée" className="h-[260px]" />
        )}
      </ChartCard>

      {/* Évolution annuelle */}
      <ChartCard title="Évolution annuelle" description="5 dernières années">
        {hasAnnual ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={charts.annual} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="year"
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
                formatter={(value) => [formatCurrency(Number(value), currency), "Revenus"]}
              />
              <Bar dataKey="value" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState icon={BarChart3} title="Pas encore de données" className="h-[260px]" />
        )}
      </ChartCard>
    </div>
  );
}
