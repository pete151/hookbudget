"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FIRST_DAY_OPTIONS,
  DATE_FORMATS,
  NUMBER_FORMATS,
  DECIMAL_SEPARATORS,
} from "@/lib/config/settings-config";
import { preferencesSchema, type PreferencesValues } from "@/lib/validations/settings";
import { updatePreferencesAction } from "@/actions/settings";

/** Formulaire des préférences de format. */
export function PreferencesForm({ preferences }: { preferences: PreferencesValues }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const { control, handleSubmit } = useForm<PreferencesValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: preferences,
  });

  function onSubmit(values: PreferencesValues) {
    startTransition(async () => {
      const res = await updatePreferencesAction(values);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Préférences enregistrées");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Premier jour de la semaine</Label>
          <Controller
            control={control}
            name="firstDayOfWeek"
            render={({ field }) => (
              <Select
                value={String(field.value)}
                onValueChange={(v) => field.onChange(Number(v))}
                disabled={isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIRST_DAY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={String(o.value)}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Format des dates</Label>
          <Controller
            control={control}
            name="dateFormat"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FORMATS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Format des nombres</Label>
          <Controller
            control={control}
            name="numberFormat"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NUMBER_FORMATS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Séparateur décimal</Label>
          <Controller
            control={control}
            name="decimalSeparator"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DECIMAL_SEPARATORS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="border-border flex items-center justify-between rounded-md border p-3">
        <div>
          <Label htmlFor="pref-default-notif">Notifications par défaut</Label>
          <p className="text-muted-foreground text-xs">
            Activer les notifications pour les nouveaux éléments.
          </p>
        </div>
        <Controller
          control={control}
          name="defaultNotifications"
          render={({ field }) => (
            <Switch
              id="pref-default-notif"
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={isPending}
              aria-label="Notifications par défaut"
            />
          )}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
