"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Language } from "@prisma/client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGES } from "@/lib/config/settings-config";
import { updateLanguageAction } from "@/actions/settings";

/** Sélecteur de langue (autosave). */
export function LanguageSelector({ current }: { current: Language }) {
  const router = useRouter();
  const [value, setValue] = React.useState<Language>(current);
  const [, startTransition] = React.useTransition();

  function choose(next: Language) {
    setValue(next);
    startTransition(async () => {
      const res = await updateLanguageAction({ language: next });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Langue mise à jour");
      router.refresh();
    });
  }

  return (
    <Select value={value} onValueChange={(v) => choose(v as Language)}>
      <SelectTrigger className="w-full sm:w-72" aria-label="Langue">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((l) => (
          <SelectItem key={l.value} value={l.value}>
            {l.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
