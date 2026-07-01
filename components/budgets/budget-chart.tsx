"use client";

import { PieChart as PieChartIcon, LineChart as LineChartIcon, BarChart3 } from "lucide-react";
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
import type { BudgetCharts } from "@/services/budgets/budget.service";

const compact = (v: number) => new Intl.NumberFormat("fr-FR", { notation: "compact" }).format(v);

/** Trois graphiques de budgets : répartition, consommation mensuelle, progression. */
export function BudgetChart({ charts, currency }: { charts: BudgetCharts; currency: string }) {
  const hasMonthly = charts.monthlyConsumption.some((d) => d.value > 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Répartition des budgets */}
      <ChartCard title="Répartition des budgets" description="Par montant alloué">
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
          <EmptyState icon={PieChartIcon} title="Aucun budget actif" className="h-[260px]" />
        )}
      </ChartCard>

      {/* Consommation mensuelle */}
      <ChartCard title="Consommation mensuelle" description="12 derniers mois">
        {hasMonthly ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={charts.monthlyConsumption}
              margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
            >
              <defs>
                <linearGradient id="budgetConsumption" x1="0" y1="0" x2="0" y2="1">
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
                tickFormatter={compact}
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
                fill="url(#budgetConsumption)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState icon={LineChartIcon} title="Pas encore de données" className="h-[260px]" />
        )}
      </ChartCard>

      {/* Progression des budgets */}
      <ChartCard title="Progression des budgets" description="Alloué vs consommé">
        {charts.progress.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={charts.progress} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                stroke="var(--muted-foreground)"
                interval={0}
                angle={-15}
                textAnchor="end"
                height={50}
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
                formatter={(value, name) => [
                  formatCurrency(Number(value), currency),
                  name === "amount" ? "Alloué" : "Consommé",
                ]}
              />
              <Legend
                formatter={(value) => (value === "amount" ? "Alloué" : "Consommé")}
                wrapperStyle={{ fontSize: "12px" }}
              />
              <Bar dataKey="amount" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spent" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState icon={BarChart3} title="Aucun budget" className="h-[260px]" />
        )}
      </ChartCard>
    </div>
  );
}
