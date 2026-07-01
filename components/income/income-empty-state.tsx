import { TrendingUp } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";

/** État vide de la liste des revenus (réutilise le composant générique). */
export function IncomeEmptyState({ filtered }: { filtered?: boolean }) {
  if (filtered) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Aucun résultat"
        description="Aucun revenu ne correspond à vos filtres."
        className="py-14"
      />
    );
  }
  return (
    <EmptyState
      icon={TrendingUp}
      title="Aucun revenu"
      description="Enregistrez votre premier revenu pour suivre vos rentrées d'argent."
      actionLabel="Ajouter un revenu"
      actionHref="/dashboard/income/new"
      className="py-14"
    />
  );
}
