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
  notificationPreferenceSchema,
  type NotificationPreferenceValues,
} from "@/lib/validations/notification";
import { updatePreferencesAction } from "@/actions/notifications";

/** Une ligne interrupteur (libellé + description + Switch). */
function ToggleRow({
  name,
  label,
  description,
  control,
  disabled,
}: {
  name: keyof NotificationPreferenceValues;
  label: string;
  description?: string;
  control: ReturnType<typeof useForm<NotificationPreferenceValues>>["control"];
  disabled: boolean;
}) {
  return (
    <div className="border-border flex items-center justify-between gap-4 border-b py-3 last:border-0">
      <div>
        <Label htmlFor={`pref-${name}`}>{label}</Label>
        {description && <p className="text-muted-foreground text-xs">{description}</p>}
      </div>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Switch
            id={`pref-${name}`}
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
            aria-label={label}
          />
        )}
      />
    </div>
  );
}

/** Formulaire des préférences de notifications. */
export function NotificationPreferencesForm({
  preferences,
}: {
  preferences: NotificationPreferenceValues;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const { control, handleSubmit } = useForm<NotificationPreferenceValues>({
    resolver: zodResolver(notificationPreferenceSchema),
    defaultValues: preferences,
  });

  function onSubmit(values: NotificationPreferenceValues) {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section>
        <h2 className="mb-1 text-sm font-medium">Alertes</h2>
        <div>
          <ToggleRow
            name="budgetAlerts"
            label="Alertes budgets"
            description="Seuils 50 / 80 / 100 %."
            control={control}
            disabled={isPending}
          />
          <ToggleRow
            name="expenseAlerts"
            label="Alertes dépenses"
            description="Dépenses importantes."
            control={control}
            disabled={isPending}
          />
          <ToggleRow
            name="incomeAlerts"
            label="Alertes revenus"
            description="Revenus importants."
            control={control}
            disabled={isPending}
          />
          <ToggleRow
            name="savingAlerts"
            label="Alertes épargne"
            description="Objectifs atteints, échéances."
            control={control}
            disabled={isPending}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-sm font-medium">Résumés</h2>
        <div>
          <ToggleRow
            name="weeklySummary"
            label="Résumé hebdomadaire"
            control={control}
            disabled={isPending}
          />
          <ToggleRow
            name="monthlySummary"
            label="Résumé mensuel"
            control={control}
            disabled={isPending}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-sm font-medium">Canaux</h2>
        <div>
          <ToggleRow
            name="emailNotifications"
            label="E-mail"
            description="Envoi réel à venir."
            control={control}
            disabled={isPending}
          />
          <ToggleRow
            name="pushNotifications"
            label="Push"
            description="Notifications push à venir."
            control={control}
            disabled={isPending}
          />
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
