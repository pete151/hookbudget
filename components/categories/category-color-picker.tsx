"use client";

import { Check } from "lucide-react";

import { Input } from "@/components/ui/input";
import { CATEGORY_COLORS } from "@/lib/config/category-colors";
import { cn } from "@/lib/utils/cn";

/** Sélecteur de couleur : palette prédéfinie + saisie hexadécimale libre. */
export function CategoryColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Couleur de la catégorie">
        {CATEGORY_COLORS.map((color) => {
          const selected = color.toLowerCase() === value.toLowerCase();
          return (
            <button
              key={color}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={color}
              onClick={() => onChange(color)}
              className={cn(
                "ring-offset-background flex h-7 w-7 items-center justify-center rounded-full ring-offset-2 transition-transform",
                "focus-visible:ring-ring hover:scale-110 focus-visible:ring-2 focus-visible:outline-none",
                selected && "ring-foreground ring-2",
              )}
              style={{ backgroundColor: color }}
            >
              {selected && <Check className="h-3.5 w-3.5 text-white" />}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <span
          className="border-border h-9 w-9 shrink-0 rounded-md border"
          style={{ backgroundColor: value }}
          aria-hidden="true"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#22c55e"
          aria-label="Code hexadécimal"
          className="font-mono"
        />
      </div>
    </div>
  );
}
