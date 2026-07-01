import { cn } from "@/lib/utils/cn";
import { BUDGET_STATUS_COLORS } from "@/lib/config/budget-config";
import type { BudgetStatus } from "@/services/budgets/budget.service";

/**
 * Barre de progression de consommation d'un budget, à **couleur dynamique**
 * (vert / orange / rouge) selon le statut. Bornée à 100 % en largeur.
 */
export function BudgetProgress({
  percent,
  status,
  className,
}: {
  percent: number;
  status: BudgetStatus;
  className?: string;
}) {
  const width = Math.min(100, Math.max(0, percent));
  const color = BUDGET_STATUS_COLORS[status];

  return (
    <div
      className={cn("bg-muted h-2 w-full overflow-hidden rounded-full", className)}
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Consommation du budget"
    >
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${width}%`, backgroundColor: color }}
      />
    </div>
  );
}
