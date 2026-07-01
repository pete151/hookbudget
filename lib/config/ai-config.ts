import {
  Lightbulb,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import type { InsightSeverity, InsightType, PredictionKind } from "@/domain/ai/types";

/** Icône associée à chaque type d'insight. */
export const INSIGHT_ICONS: Record<InsightType, LucideIcon> = {
  OPPORTUNITY: Sparkles,
  ALERT: AlertTriangle,
  ADVICE: Lightbulb,
  PREDICTION: TrendingUp,
  SUCCESS: Trophy,
};

/** Libellé lisible de chaque type d'insight. */
export const INSIGHT_LABELS: Record<InsightType, string> = {
  OPPORTUNITY: "Opportunité",
  ALERT: "Alerte",
  ADVICE: "Conseil",
  PREDICTION: "Prévision",
  SUCCESS: "Réussite",
};

/** Couleur (hex) associée à un niveau de gravité. */
export const SEVERITY_COLOR: Record<InsightSeverity, string> = {
  info: "#0ea5e9",
  success: "#16a34a",
  warning: "#f59e0b",
  danger: "#dc2626",
};

/** Libellé lisible d'un type de prévision. */
export const PREDICTION_LABELS: Record<PredictionKind, string> = {
  balance: "Solde",
  expense: "Dépenses",
  income: "Revenus",
  savings: "Épargne",
};
