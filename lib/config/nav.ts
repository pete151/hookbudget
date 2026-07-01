import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  PiggyBank,
  Target,
  BarChart3,
  Tags,
  Bell,
  Settings,
  Sparkles,
} from "lucide-react";
import type { NavItem } from "@/types";

/**
 * Liens de navigation principaux affichés dans la sidebar.
 *
 * Sprint 1 : seules les routes `/dashboard` (et l'accueil) existent réellement.
 * Les autres entrées sont prévues pour les prochains sprints.
 */
export const MAIN_NAV: NavItem[] = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { label: "Revenus", href: "/dashboard/income", icon: TrendingUp },
  { label: "Dépenses", href: "/dashboard/expenses", icon: Wallet },
  { label: "Budgets", href: "/dashboard/budgets", icon: PiggyBank },
  { label: "Objectifs", href: "/dashboard/savings", icon: Target },
  { label: "Catégories", href: "/dashboard/categories", icon: Tags },
  { label: "Rapports", href: "/dashboard/reports", icon: BarChart3 },
  { label: "Assistant IA", href: "/dashboard/ai", icon: Sparkles },
];

/** Liens secondaires (bas de la sidebar). */
export const SECONDARY_NAV: NavItem[] = [
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Paramètres", href: "/dashboard/settings", icon: Settings },
];
