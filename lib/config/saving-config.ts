import type { SavingPriority, SavingStatus } from "@prisma/client";

/** Libellés et couleurs des priorités et statuts d'objectifs d'épargne. */

export const SAVING_PRIORITIES: { value: SavingPriority; label: string }[] = [
  { value: "LOW", label: "Basse" },
  { value: "MEDIUM", label: "Moyenne" },
  { value: "HIGH", label: "Haute" },
];

export const SAVING_PRIORITY_LABELS: Record<SavingPriority, string> = {
  LOW: "Basse",
  MEDIUM: "Moyenne",
  HIGH: "Haute",
};

export const SAVING_PRIORITY_COLORS: Record<SavingPriority, string> = {
  LOW: "#64748b",
  MEDIUM: "#f59e0b",
  HIGH: "#ef4444",
};

export const SAVING_STATUS_LABELS: Record<SavingStatus, string> = {
  ACTIVE: "En cours",
  COMPLETED: "Atteint",
  PAUSED: "En pause",
  CANCELLED: "Annulé",
};

export const SAVING_STATUS_COLORS: Record<SavingStatus, string> = {
  ACTIVE: "#3b82f6",
  COMPLETED: "#22c55e",
  PAUSED: "#f59e0b",
  CANCELLED: "#64748b",
};

/**
 * Couleur de la barre de progression d'un objectif (progression = positif).
 * Rouge (faible) → Orange (moyen) → Vert (élevé / atteint).
 */
export function savingProgressColor(percent: number, status: SavingStatus): string {
  if (status === "COMPLETED" || percent >= 100) return "#22c55e";
  if (status === "PAUSED" || status === "CANCELLED") return "#94a3b8";
  if (percent >= 67) return "#22c55e";
  if (percent >= 34) return "#f59e0b";
  return "#ef4444";
}
