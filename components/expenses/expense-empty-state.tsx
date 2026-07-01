import { Wallet } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";

/** État vide de la liste des dépenses. */
export function ExpenseEmptyState({ filtered }: { filtered?: boolean }) {
  if (filtered) {
    return (
      <EmptyState
        icon={Wallet}
        title="Aucun résultat"
        description="Aucune dépense ne correspond à vos filtres."
        className="py-14"
      />
    );
  }
  return (
    <EmptyState
      icon={Wallet}
      title="Aucune dépense"
      description="Enregistrez votre première dépense pour suivre vos sorties d'argent."
      actionLabel="Ajouter une dépense"
      actionHref="/dashboard/expenses/new"
      className="py-14"
    />
  );
}
