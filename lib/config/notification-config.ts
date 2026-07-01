import type { NotificationType } from "@prisma/client";

/** Métadonnées d'affichage par type de notification (libellé + couleur). */
export const NOTIFICATION_TYPE_META: Record<NotificationType, { label: string; color: string }> = {
  INFO: { label: "Information", color: "#3b82f6" },
  SUCCESS: { label: "Succès", color: "#22c55e" },
  WARNING: { label: "Avertissement", color: "#f59e0b" },
  ERROR: { label: "Erreur", color: "#ef4444" },
  BUDGET: { label: "Budget", color: "#8b5cf6" },
  SAVING: { label: "Épargne", color: "#14b8a6" },
  INCOME: { label: "Revenu", color: "#22c55e" },
  EXPENSE: { label: "Dépense", color: "#ef4444" },
  SYSTEM: { label: "Système", color: "#64748b" },
};

/** Onglets de filtrage du centre de notifications. */
export const NOTIFICATION_TABS: { value: string; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "unread", label: "Non lues" },
  { value: "BUDGET", label: "Budget" },
  { value: "SAVING", label: "Épargne" },
  { value: "INCOME", label: "Revenus" },
  { value: "EXPENSE", label: "Dépenses" },
  { value: "SYSTEM", label: "Système" },
];
