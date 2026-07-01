"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Currency } from "@prisma/client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES } from "@/lib/config/settings-config";
import { updateCurrencyAction } from "@/actions/settings";

/** Sélecteur de devise (autosave, impacte tout le dashboard). */
export function CurrencySelector({ current }: { current: Currency }) {
  const router = useRouter();
  const [value, setValue] = React.useState<Currency>(current);
  const [, startTransition] = React.useTransition();

  function choose(next: Currency) {
    setValue(next);
    startTransition(async () => {
      const res = await updateCurrencyAction({ currency: next });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Devise mise à jour");
      router.refresh();
    });
  }

  return (
    <Select value={value} onValueChange={(v) => choose(v as Currency)}>
      <SelectTrigger className="w-full sm:w-72" aria-label="Devise">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((c) => (
          <SelectItem key={c.value} value={c.value}>
            {c.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
