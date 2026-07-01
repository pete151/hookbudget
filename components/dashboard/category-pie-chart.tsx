"use client";

import { PieChartIcon } from "lucide-react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { ChartCard, chartTooltipStyle } from "@/components/dashboard/chart-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { formatCurrency } from "@/lib/utils/format";
import type { CategorySlice } from "@/services/dashboard/dashboard.service";

/** Répartition des dépenses par catégorie (diagramme circulaire). */
export function CategoryPieChart({ data, currency }: { data: CategorySlice[]; currency: string }) {
  return (
    <ChartCard title="Dépenses par catégorie" description="Toutes périodes">
      {data.length > 0 ? (
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
      ) : (
        <EmptyState
          icon={PieChartIcon}
          title="Aucune dépense"
          description="La répartition s'affichera dès votre première dépense."
          className="h-[260px]"
        />
      )}
    </ChartCard>
  );
}
