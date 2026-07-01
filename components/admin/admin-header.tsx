"use client";

import Link from "next/link";
import { Menu, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSidebarStore } from "@/store/use-sidebar-store";

/** En-tête du Back Office : bascule menu, badge rôle, retour à l'app. */
export function AdminHeader({
  user,
  roleLabel,
}: {
  user: { name: string; email: string; image?: string | null };
  roleLabel: string;
}) {
  const toggle = useSidebarStore((s) => s.toggle);

  return (
    <header className="border-border bg-background/80 sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 backdrop-blur-sm lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Ouvrir le menu"
        onClick={toggle}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Badge variant="outline" className="hidden border-red-500/40 text-red-600 sm:inline-flex">
        {roleLabel}
      </Badge>

      <div className="ml-auto flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Retour à l&apos;app</span>
          </Link>
        </Button>
        <ThemeToggle />
        <UserMenu name={user.name} email={user.email} image={user.image} />
      </div>
    </header>
  );
}
