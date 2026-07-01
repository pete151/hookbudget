"use client";

import { TrendingDown, PieChart as PieChartIcon, CreditCard, BarChart3 } from "lucide-react";
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
import type { CategorySlice } from "@/services/dashboard/dashboard.service";
import type { ExpenseCharts } from "@/services/expenses/expense.service";

const compact = (v: number) => new Intl.NumberFormat("fr-FR", { notation: "compact" }).format(v);

/** Camembert réutilisable pour les répartitions (catégorie / paiement). */
function DistributionPie({ data, currency }: { data: CategorySlice[]; currency: string }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
          stroke="var(--background)"
        >
          {data.map((slice) => (
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
  );
}

/** Quatre graphiques de dépenses. */
export function ExpenseChart({ charts, currency }: { charts: ExpenseCharts; currency: string }) {
  const hasMonthly = charts.monthly.some((d) => d.value > 0);
  const hasAnnual = charts.annual.some((d) => d.value > 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Courbe mensuelle */}
      <ChartCard title="Dépenses mensuelles" description="12 derniers mois">
        {hasMonthly ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={charts.monthly} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="expenseMonthly" x1="0" y1="0" x2="0" y2="1">
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
                fill="url(#expenseMonthly)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState icon={TrendingDown} title="Pas encore de données" className="h-[260px]" />
        )}
      </ChartCard>

      {/* Répartition par catégorie */}
      <ChartCard title="Dépenses par catégorie" description="Toutes périodes">
        {charts.byCategory.length > 0 ? (
          <DistributionPie data={charts.byCategory} currency={currency} />
        ) : (
          <EmptyState icon={PieChartIcon} title="Aucune donnée" className="h-[260px]" />
        )}
      </ChartCard>

      {/* Répartition par mode de paiement */}
      <ChartCard title="Par mode de paiement" description="Toutes périodes">
        {charts.byPaymentMethod.length > 0 ? (
          <DistributionPie data={charts.byPaymentMethod} currency={currency} />
        ) : (
          <EmptyState icon={CreditCard} title="Aucune donnée" className="h-[260px]" />
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
                formatter={(value) => [formatCurrency(Number(value), currency), "Dépenses"]}
              />
              <Bar dataKey="value" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState icon={BarChart3} title="Pas encore de données" className="h-[260px]" />
        )}
      </ChartCard>
    </div>
  );
}
