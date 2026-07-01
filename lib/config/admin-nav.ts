import {
  LayoutDashboard,
  Users,
  CreditCard,
  Package,
  BarChart3,
  FileText,
  Bell,
  ScrollText,
  Settings,
  Flag,
  type LucideIcon,
} from "lucide-react";

import type { AdminPermission } from "@/lib/admin/rbac";

/** Élément de navigation du Back Office (avec permission requise). */
export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: AdminPermission;
}

/** Navigation du Back Office (chaque entrée est filtrée par permission). */
export const ADMIN_NAV: AdminNavItem[] = [
  {
    label: "Tableau de bord",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    permission: "analytics.view",
  },
  { label: "Utilisateurs", href: "/admin/users", icon: Users, permission: "users.view" },
  {
    label: "Abonnements",
    href: "/admin/subscriptions",
    icon: CreditCard,
    permission: "subscriptions.view",
  },
  { label: "Plans", href: "/admin/plans", icon: Package, permission: "plans.view" },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3, permission: "analytics.view" },
  { label: "Rapports", href: "/admin/reports", icon: FileText, permission: "reports.view" },
  {
    label: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
    permission: "notifications.manage",
  },
  {
    label: "Journal d'audit",
    href: "/admin/audit-logs",
    icon: ScrollText,
    permission: "audit.view",
  },
  { label: "Feature flags", href: "/admin/feature-flags", icon: Flag, permission: "flags.view" },
  { label: "Paramètres", href: "/admin/settings", icon: Settings, permission: "settings.view" },
];
