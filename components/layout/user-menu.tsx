"use client";

import { LogOut, User as UserIcon, Settings } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/actions/auth/sign-out";

interface UserMenuProps {
  name: string;
  email: string;
  image?: string | null;
}

/** Deux premières initiales du nom, pour le fallback d'avatar. */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Menu utilisateur affiché dans le header lorsqu'une session est active.
 * Présente l'avatar, le nom, l'e-mail et le bouton de déconnexion.
 */
export function UserMenu({ name, email, image }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="focus-visible:ring-ring flex items-center gap-2 rounded-full outline-none focus-visible:ring-2"
          aria-label="Menu utilisateur"
        >
          <Avatar className="h-9 w-9">
            {image && <AvatarImage src={image} alt={name} />}
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          {/* Nom visible à partir de sm */}
          <span className="hidden text-sm font-medium sm:inline">{name}</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="font-medium">{name}</span>
          <span className="text-muted-foreground text-xs font-normal">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <UserIcon className="h-4 w-4" />
            Tableau de bord
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/parametres">
            <Settings className="h-4 w-4" />
            Paramètres
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Déconnexion via Server Action */}
        <form action={signOutAction}>
          <DropdownMenuItem asChild>
            <Button
              type="submit"
              variant="ghost"
              className="text-destructive hover:text-destructive focus:text-destructive w-full justify-start px-2 font-normal"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </Button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
