"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { toast } from "sonner";
import type { Theme } from "@prisma/client";

import { cn } from "@/lib/utils/cn";
import { updateAppearanceAction } from "@/actions/settings";

const OPTIONS: { value: Theme; label: string; icon: typeof Sun; theme: string }[] = [
  { value: "LIGHT", label: "Clair", icon: Sun, theme: "light" },
  { value: "DARK", label: "Sombre", icon: Moon, theme: "dark" },
  { value: "SYSTEM", label: "Système", icon: Monitor, theme: "system" },
];

/** Sélecteur d'apparence (autosave + application immédiate du thème). */
export function AppearanceSelector({ current }: { current: Theme }) {
  const { setTheme } = useTheme();
  const [selected, setSelected] = React.useState<Theme>(current);
  const [, startTransition] = React.useTransition();

  function choose(option: (typeof OPTIONS)[number]) {
    setSelected(option.value);
    setTheme(option.theme);
    startTransition(async () => {
      const res = await updateAppearanceAction({ theme: option.value });
      if (!res.success) toast.error(res.error);
      else toast.success("Apparence enregistrée");
    });
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Thème">
      {OPTIONS.map((o) => {
        const Icon = o.icon;
        const active = selected === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => choose(o)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
              active ? "border-primary bg-accent" : "border-border hover:bg-accent/50",
            )}
          >
            <Icon className="h-6 w-6" />
            <span className="text-sm font-medium">{o.label}</span>
            {active && <Check className="text-primary h-4 w-4" />}
          </button>
        );
      })}
    </div>
  );
}
