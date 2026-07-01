import { Target } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";

/** État vide de la liste des objectifs d'épargne. */
export function SavingGoalEmptyState() {
  return (
    <EmptyState
      icon={Target}
      title="Aucun objectif"
      description="Créez votre premier objectif d'épargne et suivez sa progression."
      actionLabel="Créer un objectif"
      actionHref="/dashboard/savings/new"
      className="py-14"
    />
  );
}
