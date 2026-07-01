import { BellOff } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";

/** État vide du centre de notifications. */
export function NotificationEmptyState() {
  return (
    <EmptyState
      icon={BellOff}
      title="Aucune notification"
      description="Vos alertes de budgets, d'épargne et de transactions apparaîtront ici."
      className="py-14"
    />
  );
}
