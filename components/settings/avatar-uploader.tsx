"use client";

import { ImageIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Sélecteur de photo de profil.
 * ⚠️ Sprint 12 : pas d'upload réel — l'utilisateur renseigne une URL d'image.
 * L'infrastructure d'upload (stockage) sera ajoutée ultérieurement.
 */
export function AvatarUploader({
  value,
  onChange,
  name,
  disabled,
}: {
  value: string;
  onChange: (url: string) => void;
  name: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        {value ? <AvatarImage src={value} alt={name} /> : null}
        <AvatarFallback className="bg-primary/10 text-primary text-lg">
          {name ? initials(name) : <ImageIcon className="h-6 w-6" />}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <Label htmlFor="avatar-url">Photo (URL)</Label>
        <Input
          id="avatar-url"
          type="url"
          inputMode="url"
          placeholder="https://…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
        <p className="text-muted-foreground text-xs">
          L&apos;upload de fichier arrivera plus tard.
        </p>
      </div>
    </div>
  );
}
