import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import type { BudgetView } from "@/services/dashboard/dashboard.service";

/** Carte d'un budget : montant alloué, dépensé, restant + progression. */
export function BudgetCard({ budget, currency }: { budget: BudgetView; currency: string }) {
  const overBudget = budget.remaining < 0;

  return (
    <div className="border-border rounded-lg border p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{budget.name}</p>
          {budget.categoryName && (
            <p className="text-muted-foreground truncate text-xs">{budget.categoryName}</p>
          )}
        </div>
        <span className="shrink-0 text-sm font-semibold">
          {formatCurrency(budget.amount, currency)}
        </span>
      </div>

      <Progress value={budget.percent} className="h-2" />

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Dépensé {formatCurrency(budget.spent, currency)}
        </span>
        <span className={cn("font-medium", overBudget ? "text-destructive" : "text-primary")}>
          {overBudget
            ? `Dépassé de ${formatCurrency(Math.abs(budget.remaining), currency)}`
            : `Restant ${formatCurrency(budget.remaining, currency)}`}
        </span>
      </div>
    </div>
  );
}
