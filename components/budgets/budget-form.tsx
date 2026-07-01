"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldError } from "@/components/auth/form-parts";
import { budgetSchema, type BudgetFormValues } from "@/lib/validations/budget";
import { BUDGET_PERIODS, BUDGET_TYPES } from "@/lib/config/budget-config";

/** Catégorie minimale nécessaire au formulaire. */
export interface BudgetFormCategory {
  id: string;
  name: string;
  color: string | null;
}

/** Formulaire de création / édition d'un budget. */
export function BudgetForm({
  defaultValues,
  categories,
  onSubmit,
  onCancel,
  pending,
  mode,
}: {
  defaultValues: BudgetFormValues;
  categories: BudgetFormCategory[];
  onSubmit: (values: BudgetFormValues, addAnother: boolean) => void;
  onCancel: () => void;
  pending: boolean;
  mode: "create" | "edit";
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    mode: "onBlur",
    defaultValues,
  });

  const budgetType = useWatch({
    control,
    name: "budgetType",
    defaultValue: defaultValues.budgetType,
  });

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v, false))} className="space-y-4" noValidate>
      {/* Nom */}
      <div className="space-y-2">
        <Label htmlFor="budget-name">Nom</Label>
        <Input
          id="budget-name"
          placeholder="Ex. Budget alimentation"
          disabled={pending}
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        <FieldError message={errors.name?.message} />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="budget-description">Description (facultatif)</Label>
        <Textarea
          id="budget-description"
          rows={2}
          placeholder="À quoi sert ce budget ?"
          disabled={pending}
          aria-invalid={Boolean(errors.description)}
          {...register("description")}
        />
        <FieldError message={errors.description?.message} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Montant */}
        <div className="space-y-2">
          <Label htmlFor="budget-amount">Montant</Label>
          <Input
            id="budget-amount"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            placeholder="0"
            disabled={pending}
            aria-invalid={Boolean(errors.amount)}
            {...register("amount", { valueAsNumber: true })}
          />
          <FieldError message={errors.amount?.message} />
        </div>

        {/* Période */}
        <div className="space-y-2">
          <Label htmlFor="budget-period">Période</Label>
          <Controller
            control={control}
            name="period"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={pending}>
                <SelectTrigger id="budget-period" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_PERIODS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* Type de budget */}
      <div className="space-y-2">
        <Label htmlFor="budget-type">Type de budget</Label>
        <Controller
          control={control}
          name="budgetType"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={pending}>
              <SelectTrigger id="budget-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BUDGET_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Catégorie (si type = CATEGORY) */}
      {budgetType === "CATEGORY" && (
        <div className="space-y-2">
          <Label htmlFor="budget-category">Catégorie</Label>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange} disabled={pending}>
                <SelectTrigger
                  id="budget-category"
                  className="w-full"
                  aria-invalid={Boolean(errors.categoryId)}
                >
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: cat.color ?? "#94a3b8" }}
                        />
                        {cat.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.categoryId?.message} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Date début */}
        <div className="space-y-2">
          <Label htmlFor="budget-start">Date de début</Label>
          <Input
            id="budget-start"
            type="date"
            disabled={pending}
            aria-invalid={Boolean(errors.startDate)}
            {...register("startDate")}
          />
          <FieldError message={errors.startDate?.message} />
        </div>

        {/* Date fin */}
        <div className="space-y-2">
          <Label htmlFor="budget-end">Date de fin</Label>
          <Input
            id="budget-end"
            type="date"
            disabled={pending}
            aria-invalid={Boolean(errors.endDate)}
            {...register("endDate")}
          />
          <FieldError message={errors.endDate?.message} />
        </div>
      </div>

      {/* Alertes */}
      <div className="border-border space-y-3 rounded-md border p-3">
        <p className="text-sm font-medium">Alertes de consommation</p>
        {(
          [
            ["alert50", "À 50 %"],
            ["alert80", "À 80 %"],
            ["alert100", "À 100 %"],
          ] as const
        ).map(([name, label]) => (
          <div key={name} className="flex items-center justify-between">
            <Label htmlFor={`budget-${name}`} className="font-normal">
              {label}
            </Label>
            <Controller
              control={control}
              name={name}
              render={({ field }) => (
                <Switch
                  id={`budget-${name}`}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={pending}
                  aria-label={`Alerte ${label}`}
                />
              )}
            />
          </div>
        ))}
      </div>

      {/* Budget actif */}
      <div className="border-border flex items-center justify-between rounded-md border p-3">
        <div>
          <Label htmlFor="budget-active">Budget actif</Label>
          <p className="text-muted-foreground text-xs">Suivi et compté dans les statistiques.</p>
        </div>
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <Switch
              id="budget-active"
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={pending}
              aria-label="Budget actif"
            />
          )}
        />
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
