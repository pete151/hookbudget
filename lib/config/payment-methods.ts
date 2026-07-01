import type { PaymentMethod, RecurrenceFrequency } from "@prisma/client";

/**
 * Libellés et options des modes de paiement et fréquences de récurrence.
 * Utilisés par le formulaire, les filtres, le tableau et les graphiques.
 */

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Espèces" },
  { value: "CARD", label: "Carte bancaire" },
  { value: "TRANSFER", label: "Virement" },
  { value: "MOBILE_MONEY", label: "Mobile Money" },
  { value: "CHEQUE", label: "Chèque" },
  { value: "OTHER", label: "Autre" },
];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Espèces",
  CARD: "Carte bancaire",
  TRANSFER: "Virement",
  MOBILE_MONEY: "Mobile Money",
  CHEQUE: "Chèque",
  OTHER: "Autre",
};

/** Couleurs associées aux modes de paiement (graphique de répartition). */
export const PAYMENT_METHOD_COLORS: Record<PaymentMethod, string> = {
  CASH: "#22c55e",
  CARD: "#3b82f6",
  TRANSFER: "#8b5cf6",
  MOBILE_MONEY: "#f59e0b",
  CHEQUE: "#14b8a6",
  OTHER: "#64748b",
};

export const RECURRENCE_FREQUENCIES: { value: RecurrenceFrequency; label: string }[] = [
  { value: "DAILY", label: "Quotidienne" },
  { value: "WEEKLY", label: "Hebdomadaire" },
  { value: "MONTHLY", label: "Mensuelle" },
  { value: "YEARLY", label: "Annuelle" },
];

export const RECURRENCE_FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  DAILY: "Quotidienne",
  WEEKLY: "Hebdomadaire",
  MONTHLY: "Mensuelle",
  YEARLY: "Annuelle",
};
