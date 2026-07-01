/**
 * Types partagés de l'application HookBudget.
 *
 * Sprint 1 : uniquement des types de présentation (UI). Aucune entité métier
 * ni modèle de base de données n'est défini ici pour l'instant.
 */

import type { LucideIcon } from "lucide-react";

/** Élément de navigation de la sidebar. */
export interface NavItem {
  /** Libellé affiché. */
  label: string;
  /** Destination (route Next.js). */
  href: string;
  /** Icône Lucide associée. */
  icon: LucideIcon;
}

/** Tendance d'une statistique (utilisée par les cartes du dashboard). */
export type Trend = "up" | "down" | "neutral";

/** Donnée affichée par une carte statistique du dashboard. */
export interface StatCardData {
  /** Identifiant unique de la carte. */
  id: string;
  /** Titre (ex. "Revenus"). */
  title: string;
  /** Valeur déjà formatée (ex. "1 250 000 FCFA"). */
  value: string;
  /** Variation textuelle (ex. "+12,4 %"). */
  change: string;
  /** Sens de la tendance, pour la couleur. */
  trend: Trend;
  /** Icône Lucide. */
  icon: LucideIcon;
}
