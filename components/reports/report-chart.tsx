"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartCard, chartTooltipStyle } from "@/components/dashboard/chart-card";
import { formatCurrency } from "@/lib/utils/format";
import type { ReportData } from "@/domain/reports/types";

const compact = (v: number) => new Intl.NumberFormat("fr-FR", { notation: "compact" }).format(v);

/** Ensemble de graphiques d'un rapport. */
export function ReportChart({ data, currency }: { data: ReportData; currency: string }) {
  const money = (v: number) => formatCurrency(Number(v), currency);
  const hasMonthly = data.monthly.some((m) => m.income > 0 || m.expense > 0);
  const hasCash = data.cashFlow.some((c) => c.net !== 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {hasMonthly && (
        <ChartCard title="Revenus vs Dépenses" description="Par mois">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.monthly} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
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
                formatter={(v, n) => [money(Number(v)), n === "income" ? "Revenus" : "Dépenses"]}
              />
              <Legend
                formatter={(v) => (v === "income" ? "Revenus" : "Dépenses")}
                wrapperStyle={{ fontSize: "12px" }}
              />
              <Bar dataKey="income" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {hasCash && (
        <ChartCard title="Flux de trésorerie" description="Solde net mensuel">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.cashFlow} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
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
              <Tooltip {...chartTooltipStyle} formatter={(v) => [money(Number(v)), "Net"]} />
              <Line
                type="monotone"
                dataKey="net"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {data.expenseByCategory.length > 0 && (
        <ChartCard title="Dépenses par catégorie">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data.expenseByCategory}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
                stroke="var(--background)"
              >
                {data.expenseByCategory.map((s) => (
                  <Cell key={s.name} fill={s.color} />
                ))}
              </Pie>
              <Tooltip {...chartTooltipStyle} formatter={(v, n) => [money(Number(v)), String(n)]} />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: "12px", color: "var(--muted-foreground)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {data.incomeByCategory.length > 0 && (
        <ChartCard title="Revenus par catégorie">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data.incomeByCategory}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
                stroke="var(--background)"
              >
                {data.incomeByCategory.map((s) => (
                  <Cell key={s.name} fill={s.color} />
                ))}
              </Pie>
              <Tooltip {...chartTooltipStyle} formatter={(v, n) => [money(Number(v)), String(n)]} />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: "12px", color: "var(--muted-foreground)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {data.budgets.length > 0 && (
        <ChartCard title="Progression des budgets" description="Alloué vs consommé">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.budgets} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                fontSize={10}
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
                formatter={(v, n) => [money(Number(v)), n === "amount" ? "Alloué" : "Consommé"]}
              />
              <Legend
                formatter={(v) => (v === "amount" ? "Alloué" : "Consommé")}
                wrapperStyle={{ fontSize: "12px" }}
              />
              <Bar dataKey="amount" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spent" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {data.savings.length > 0 && (
        <ChartCard title="Progression des objectifs" description="Cible vs épargné">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.savings} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                fontSize={10}
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
                formatter={(v, n) => [money(Number(v)), n === "target" ? "Cible" : "Épargné"]}
              />
              <Legend
                formatter={(v) => (v === "target" ? "Cible" : "Épargné")}
                wrapperStyle={{ fontSize: "12px" }}
              />
              <Bar dataKey="target" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="current" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}
