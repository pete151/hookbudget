"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { SystemSettingView } from "@/services/admin/setting.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateSettingsAction } from "@/actions/admin/settings";

/** Formulaire de gestion des paramètres système (clé/valeur typés). */
export function SystemSettingsForm({
  settings,
  canManage,
}: {
  settings: SystemSettingView[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = React.useState<Record<string, string>>(
    Object.fromEntries(settings.map((s) => [s.key, s.value])),
  );
  const [pending, startTransition] = React.useTransition();

  function update(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function save() {
    startTransition(async () => {
      const entries = settings.map((s) => ({ key: s.key, value: values[s.key] ?? "" }));
      const res = await updateSettingsAction({ entries });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Paramètres enregistrés");
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {settings.map((s) => (
        <div key={s.key} className="space-y-1.5">
          <Label htmlFor={`setting-${s.key}`}>{s.label}</Label>
          {s.type === "BOOLEAN" ? (
            <div className="flex items-center gap-2">
              <Switch
                id={`setting-${s.key}`}
                checked={values[s.key] === "true"}
                onCheckedChange={(v) => update(s.key, v ? "true" : "false")}
                disabled={!canManage || pending}
                aria-label={s.label}
              />
              <span className="text-muted-foreground text-sm">
                {values[s.key] === "true" ? "Activé" : "Désactivé"}
              </span>
            </div>
          ) : (
            <Input
              id={`setting-${s.key}`}
              type={s.type === "NUMBER" ? "number" : "text"}
              value={values[s.key] ?? ""}
              onChange={(e) => update(s.key, e.target.value)}
              disabled={!canManage || pending}
            />
          )}
          {s.description && <p className="text-muted-foreground text-xs">{s.description}</p>}
        </div>
      ))}

      {canManage && (
        <div className="flex justify-end">
          <Button onClick={save} disabled={pending}>
            Enregistrer
          </Button>
        </div>
      )}
    </div>
  );
}
