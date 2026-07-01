import { PiggyBank } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";

/** État vide de la liste des budgets. */
export function BudgetEmptyState() {
  return (
    <EmptyState
      icon={PiggyBank}
      title="Aucun budget"
      description="Créez votre premier budget pour suivre automatiquement vos dépenses."
      actionLabel="Créer un budget"
      actionHref="/dashboard/budgets/new"
      className="py-14"
    />
  );
}
