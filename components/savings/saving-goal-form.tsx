"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldError } from "@/components/auth/form-parts";
import { CategoryIcon } from "@/components/categories/category-icon";
import { CategoryIconPicker } from "@/components/categories/category-icon-picker";
import { CategoryColorPicker } from "@/components/categories/category-color-picker";
import { savingGoalSchema, type SavingGoalFormValues } from "@/lib/validations/saving";
import { SAVING_PRIORITIES } from "@/lib/config/saving-config";

/** Formulaire de création / édition d'un objectif d'épargne. */
export function SavingGoalForm({
  defaultValues,
  onSubmit,
  onCancel,
  pending,
  mode,
}: {
  defaultValues: SavingGoalFormValues;
  onSubmit: (values: SavingGoalFormValues, addAnother: boolean) => void;
  onCancel: () => void;
  pending: boolean;
  mode: "create" | "edit";
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SavingGoalFormValues>({
    resolver: zodResolver(savingGoalSchema),
    mode: "onBlur",
    defaultValues,
  });

  const preview = useWatch({ control, defaultValue: defaultValues });

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v, false))} className="space-y-4" noValidate>
      {/* Aperçu */}
      <div className="border-border bg-muted/30 flex items-center gap-3 rounded-lg border p-3">
        <CategoryIcon name={preview.icon} color={preview.color} />
        <p className="truncate text-sm font-medium">{preview.name || "Nom de l'objectif"}</p>
      </div>

      {/* Nom */}
      <div className="space-y-2">
        <Label htmlFor="goal-name">Nom</Label>
        <Input
          id="goal-name"
          placeholder="Ex. Voyage, Fonds d'urgence…"
          disabled={pending}
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        <FieldError message={errors.name?.message} />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="goal-description">Description (facultatif)</Label>
        <Textarea
          id="goal-description"
          rows={2}
          placeholder="Pourquoi cet objectif ?"
          disabled={pending}
          aria-invalid={Boolean(errors.description)}
          {...register("description")}
        />
        <FieldError message={errors.description?.message} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Montant cible */}
        <div className="space-y-2">
          <Label htmlFor="goal-amount">Montant cible</Label>
          <Input
            id="goal-amount"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            placeholder="0"
            disabled={pending}
            aria-invalid={Boolean(errors.targetAmount)}
            {...register("targetAmount", { valueAsNumber: true })}
          />
          <FieldError message={errors.targetAmount?.message} />
        </div>

        {/* Date cible */}
        <div className="space-y-2">
          <Label htmlFor="goal-date">Date cible (facultatif)</Label>
          <Input
            id="goal-date"
            type="date"
            disabled={pending}
            aria-invalid={Boolean(errors.targetDate)}
            {...register("targetDate")}
          />
          <FieldError message={errors.targetDate?.message} />
        </div>
      </div>

      {/* Priorité */}
      <div className="space-y-2">
        <Label htmlFor="goal-priority">Priorité</Label>
        <Controller
          control={control}
          name="priority"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={pending}>
              <SelectTrigger id="goal-priority" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SAVING_PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Icône */}
      <div className="space-y-2">
        <Label>Icône</Label>
        <Controller
          control={control}
          name="icon"
          render={({ field }) => (
            <CategoryIconPicker
              value={field.value}
              onChange={field.onChange}
              color={preview.color}
            />
          )}
        />
        <FieldError message={errors.icon?.message} />
      </div>

      {/* Couleur */}
      <div className="space-y-2">
        <Label>Couleur</Label>
        <Controller
          control={control}
          name="color"
          render={({ field }) => (
            <CategoryColorPicker value={field.value} onChange={field.onChange} />
          )}
        />
        <FieldError message={errors.color?.message} />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          Annuler
        </Button>
        {mode === "create" && (
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={handleSubmit((v) => onSubmit(v, true))}
          >
            Enregistrer et ajouter un autre
          </Button>
        )}
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
