import { CheckCircle2 } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { SavingGoalView } from "@/services/dashboard/dashboard.service";

/** Carte d'un objectif d'épargne : cible, montant actuel, progression. */
export function SavingGoalCard({ goal, currency }: { goal: SavingGoalView; currency: string }) {
  return (
    <div className="border-border rounded-lg border p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {goal.completed && <CheckCircle2 className="text-primary h-4 w-4 shrink-0" />}
          <p className="truncate text-sm font-medium">{goal.name}</p>
        </div>
        <span className="text-primary shrink-0 text-sm font-semibold">{goal.percent}%</span>
      </div>

      <Progress value={goal.percent} className="h-2" />

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {formatCurrency(goal.currentAmount, currency)} /{" "}
          {formatCurrency(goal.targetAmount, currency)}
        </span>
        {goal.deadline && (
          <span className={cn("text-muted-foreground")}>Échéance {formatDate(goal.deadline)}</span>
        )}
      </div>
    </div>
  );
}
