"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Paperclip } from "lucide-react";

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
import { expenseSchema, type ExpenseFormValues } from "@/lib/validations/expense";
import { PAYMENT_METHODS, RECURRENCE_FREQUENCIES } from "@/lib/config/payment-methods";

/** Catégorie minimale nécessaire au formulaire. */
export interface ExpenseFormCategory {
  id: string;
  name: string;
  color: string | null;
}

/** Formulaire de création / édition d'une dépense. */
export function ExpenseForm({
  defaultValues,
  categories,
  onSubmit,
  onCancel,
  pending,
  mode,
}: {
  defaultValues: ExpenseFormValues;
  categories: ExpenseFormCategory[];
  onSubmit: (values: ExpenseFormValues, addAnother: boolean) => void;
  onCancel: () => void;
  pending: boolean;
  mode: "create" | "edit";
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    mode: "onBlur",
    defaultValues,
  });

  const isRecurring = useWatch({
    control,
    name: "isRecurring",
    defaultValue: defaultValues.isRecurring,
  });

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v, false))} className="space-y-4" noValidate>
      {/* Titre */}
      <div className="space-y-2">
        <Label htmlFor="expense-title">Titre</Label>
        <Input
          id="expense-title"
          placeholder="Ex. Courses du mois"
          disabled={pending}
          aria-invalid={Boolean(errors.title)}
          {...register("title")}
        />
        <FieldError message={errors.title?.message} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Montant */}
        <div className="space-y-2">
          <Label htmlFor="expense-amount">Montant</Label>
          <Input
            id="expense-amount"
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

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="expense-date">Date</Label>
          <Input
            id="expense-date"
            type="date"
            disabled={pending}
            aria-invalid={Boolean(errors.date)}
            {...register("date")}
          />
          <FieldError message={errors.date?.message} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Catégorie */}
        <div className="space-y-2">
          <Label htmlFor="expense-category">Catégorie</Label>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={pending}>
                <SelectTrigger
                  id="expense-category"
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

        {/* Mode de paiement */}
        <div className="space-y-2">
          <Label htmlFor="expense-payment">Mode de paiement</Label>
          <Controller
            control={control}
            name="paymentMethod"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={pending}>
                <SelectTrigger
                  id="expense-payment"
                  className="w-full"
                  aria-invalid={Boolean(errors.paymentMethod)}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((pm) => (
                    <SelectItem key={pm.value} value={pm.value}>
                      {pm.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.paymentMethod?.message} />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="expense-description">Description (facultatif)</Label>
        <Textarea
          id="expense-description"
          rows={2}
          placeholder="Détails de la dépense…"
          disabled={pending}
          aria-invalid={Boolean(errors.description)}
          {...register("description")}
        />
        <FieldError message={errors.description?.message} />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="expense-notes">Notes (facultatif)</Label>
        <Textarea
          id="expense-notes"
          rows={2}
          placeholder="Notes internes…"
          disabled={pending}
          aria-invalid={Boolean(errors.notes)}
          {...register("notes")}
        />
        <FieldError message={errors.notes?.message} />
      </div>

      {/* Pièce jointe (préparée, sans upload réel) */}
      <div className="space-y-2">
        <Label>Pièce jointe</Label>
        <div className="border-border bg-muted/30 text-muted-foreground flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm">
          <Paperclip className="h-4 w-4" />
          Ajout de justificatif — bientôt disponible
        </div>
      </div>

      {/* Récurrence */}
      <div className="border-border space-y-3 rounded-md border p-3">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="expense-recurring">Dépense récurrente</Label>
            <p className="text-muted-foreground text-xs">Se répète automatiquement.</p>
          </div>
          <Controller
            control={control}
            name="isRecurring"
            render={({ field }) => (
              <Switch
                id="expense-recurring"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={pending}
                aria-label="Dépense récurrente"
              />
            )}
          />
        </div>

        {isRecurring && (
          <div className="space-y-2">
            <Label htmlFor="expense-frequency">Fréquence</Label>
            <Controller
              control={control}
              name="frequency"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={pending}>
                  <SelectTrigger id="expense-frequency" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RECURRENCE_FREQUENCIES.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        )}
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
            Enregistrer et ajouter une autre
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
