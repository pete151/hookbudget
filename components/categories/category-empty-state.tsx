import { FolderPlus } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";

/**
 * État vide du module Catégories.
 * Réutilise le composant générique `EmptyState`. `onCreate` est optionnel :
 * fourni, il affiche un bouton d'action piloté par le parent (client).
 */
export function CategoryEmptyState({
  title = "Aucune catégorie",
  description = "Créez votre première catégorie personnelle pour organiser vos finances.",
}: {
  title?: string;
  description?: string;
}) {
  return <EmptyState icon={FolderPlus} title={title} description={description} className="py-14" />;
}
