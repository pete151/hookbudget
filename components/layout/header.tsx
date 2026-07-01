"use client";

import Link from "next/link";
import { Menu, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useSidebarStore } from "@/store/use-sidebar-store";
import type { NotificationView } from "@/services/notifications/notification.service";

interface HeaderProps {
  /** Utilisateur connecté, ou `null` si la session est absente. */
  user: { name: string; email: string; image?: string | null } | null;
  /** Données de la cloche (dernières notifications + compteur non lues). */
  notifications?: { items: NotificationView[]; unreadCount: number };
}

/**
 * En-tête de l'espace applicatif.
 * - Connecté : recherche, notifications et menu utilisateur (avatar/nom/email).
 * - Non connecté : bouton « Connexion ».
 */
export function Header({ user, notifications }: HeaderProps) {
  const toggle = useSidebarStore((s) => s.toggle);

  return (
    <header className="border-border bg-background/80 sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 backdrop-blur-sm lg:px-6">
      {/* Ouvre la sidebar sur mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Ouvrir le menu"
        onClick={toggle}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Recherche (factice — sera branchée plus tard) */}
      <div className="relative hidden max-w-md flex-1 sm:block">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <input
          type="search"
          disabled
          placeholder="Rechercher (bientôt disponible)…"
          className="border-input bg-secondary/50 placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border pr-3 pl-9 text-sm outline-none focus-visible:ring-2"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        {user ? (
          <>
            <NotificationBell
              items={notifications?.items ?? []}
              unreadCount={notifications?.unreadCount ?? 0}
            />
            <UserMenu name={user.name} email={user.email} image={user.image} />
          </>
        ) : (
          <Button asChild>
            <Link href="/login">Connexion</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
