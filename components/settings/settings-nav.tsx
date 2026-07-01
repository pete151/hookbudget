"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  IdCard,
  ShieldCheck,
  SlidersHorizontal,
  Palette,
  Coins,
  Languages,
  ArrowLeftRight,
  Bell,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type { NavItem } from "@/types";

const SETTINGS_NAV: NavItem[] = [
  { label: "Profil", href: "/dashboard/settings/profile", icon: User },
  { label: "Compte", href: "/dashboard/settings/account", icon: IdCard },
  { label: "Sécurité", href: "/dashboard/settings/security", icon: ShieldCheck },
  { label: "Préférences", href: "/dashboard/settings/preferences", icon: SlidersHorizontal },
  { label: "Apparence", href: "/dashboard/settings/appearance", icon: Palette },
  { label: "Devise", href: "/dashboard/settings/currency", icon: Coins },
  { label: "Langue", href: "/dashboard/settings/language", icon: Languages },
  { label: "Import / Export", href: "/dashboard/settings/import-export", icon: ArrowLeftRight },
  { label: "Notifications", href: "/dashboard/settings/notifications", icon: Bell },
];

/** Sous-navigation du centre de paramètres. */
export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible"
      aria-label="Paramètres"
    >
      {SETTINGS_NAV.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              active && "bg-accent text-accent-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
