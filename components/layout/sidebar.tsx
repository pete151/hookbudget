"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, X } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { MAIN_NAV, SECONDARY_NAV } from "@/lib/config/nav";
import { useSidebarStore } from "@/store/use-sidebar-store";
import type { NavItem } from "@/types";

/** Logo + nom de l'application. */
function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2 px-2">
      <span className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-lg">
        <Wallet className="h-5 w-5" />
      </span>
      <span className="text-lg font-semibold tracking-tight">HookBudget</span>
    </Link>
  );
}

/** Un lien de navigation, surligné lorsqu'il est actif. */
function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {item.label}
    </Link>
  );
}

/** Contenu interne de la sidebar (partagé desktop + drawer mobile). */
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-6 py-5">
      <Brand />

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {MAIN_NAV.map((item) => (
          <NavLink key={item.href} item={item} onNavigate={onNavigate} />
        ))}
      </nav>

      <nav className="border-sidebar-border flex flex-col gap-1 border-t px-3 pt-4">
        {SECONDARY_NAV.map((item) => (
          <NavLink key={item.href} item={item} onNavigate={onNavigate} />
        ))}
      </nav>
    </div>
  );
}

/**
 * Sidebar de l'application.
 * - Desktop : fixe à gauche (visible à partir de `lg`).
 * - Mobile : drawer coulissant piloté par le store Zustand.
 */
export function Sidebar() {
  const { isOpen, close } = useSidebarStore();

  return (
    <>
      {/* Sidebar fixe — desktop */}
      <aside className="border-sidebar-border bg-sidebar hidden w-64 shrink-0 border-r lg:block">
        <SidebarContent />
      </aside>

      {/* Drawer — mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <button
            type="button"
            aria-label="Fermer le menu"
            className="bg-foreground/40 absolute inset-0 backdrop-blur-sm"
            onClick={close}
          />
          {/* Panneau */}
          <div className="border-sidebar-border bg-sidebar absolute top-0 left-0 h-full w-64 border-r shadow-xl">
            <button
              type="button"
              aria-label="Fermer le menu"
              onClick={close}
              className="text-sidebar-foreground/70 hover:bg-sidebar-accent absolute top-4 right-3 rounded-md p-1"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={close} />
          </div>
        </div>
      )}
    </>
  );
}
