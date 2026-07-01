import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { StatCardData } from "@/types";

const trendStyles: Record<StatCardData["trend"], string> = {
  up: "text-primary",
  down: "text-destructive",
  neutral: "text-muted-foreground",
};

const trendIcon = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  neutral: Minus,
} as const;

/**
 * Carte statistique du dashboard (ex. « Revenus »).
 * `caption` personnalise le libellé sous la variation (défaut « vs mois dernier »).
 */
export function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  caption = "vs mois dernier",
  hideChange = false,
  subtitle,
}: StatCardData & { caption?: string; hideChange?: boolean; subtitle?: string }) {
  const TrendIcon = trendIcon[trend];

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
        <span className="bg-accent text-accent-foreground flex h-8 w-8 items-center justify-center rounded-md">
          <Icon className="h-4 w-4" />
        </span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {hideChange ? (
          subtitle && <p className="text-muted-foreground mt-1 text-xs">{subtitle}</p>
        ) : (
          <p className={cn("mt-1 flex items-center gap-1 text-xs font-medium", trendStyles[trend])}>
            <TrendIcon className="h-3.5 w-3.5" />
            {change}
            {caption && <span className="text-muted-foreground">{caption}</span>}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
