import type { BudgetType, BudgetPeriod } from "@prisma/client";
import type { BudgetStatus } from "@/services/budgets/budget.service";

/** Libellés et options des types et périodes de budget. */

export const BUDGET_TYPES: { value: BudgetType; label: string }[] = [
  { value: "GLOBAL", label: "Global" },
  { value: "CATEGORY", label: "Par catégorie" },
  { value: "PROJECT", label: "Projet" },
];

export const BUDGET_TYPE_LABELS: Record<BudgetType, string> = {
  GLOBAL: "Global",
  CATEGORY: "Par catégorie",
  PROJECT: "Projet",
};

export const BUDGET_PERIODS: { value: BudgetPeriod; label: string }[] = [
  { value: "MONTHLY", label: "Mensuel" },
  { value: "WEEKLY", label: "Hebdomadaire" },
  { value: "YEARLY", label: "Annuel" },
  { value: "CUSTOM", label: "Personnalisé" },
];

export const BUDGET_PERIOD_LABELS: Record<BudgetPeriod, string> = {
  MONTHLY: "Mensuel",
  WEEKLY: "Hebdomadaire",
  YEARLY: "Annuel",
  CUSTOM: "Personnalisé",
};

/** Couleur associée à l'état de consommation d'un budget. */
export const BUDGET_STATUS_COLORS: Record<BudgetStatus, string> = {
  ok: "#22c55e", // vert
  warning: "#f59e0b", // orange
  danger: "#ef4444", // rouge
  inactive: "#94a3b8", // gris
};

export const BUDGET_STATUS_LABELS: Record<BudgetStatus, string> = {
  ok: "Sous contrôle",
  warning: "À surveiller",
  danger: "Critique",
  inactive: "Inactif",
};
