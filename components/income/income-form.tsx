"use client";

import { Controller, useForm } from "react-hook-form";
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
import { incomeSchema, type IncomeFormValues } from "@/lib/validations/income";

/** Catégorie minimale nécessaire au formulaire. */
export interface IncomeFormCategory {
  id: string;
  name: string;
  color: string | null;
}

/** Formulaire de création / édition d'un revenu. */
export function IncomeForm({
  defaultValues,
  categories,
  onSubmit,
  onCancel,
  pending,
  mode,
}: {
  defaultValues: IncomeFormValues;
  categories: IncomeFormCategory[];
  onSubmit: (values: IncomeFormValues, addAnother: boolean) => void;
  onCancel: () => void;
  pending: boolean;
  mode: "create" | "edit";
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    mode: "onBlur",
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v, false))} className="space-y-4" noValidate>
      {/* Titre */}
      <div className="space-y-2">
        <Label htmlFor="income-title">Titre</Label>
        <Input
          id="income-title"
          placeholder="Ex. Salaire de juin"
          disabled={pending}
          aria-invalid={Boolean(errors.title)}
          {...register("title")}
        />
        <FieldError message={errors.title?.message} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Montant */}
        <div className="space-y-2">
          <Label htmlFor="income-amount">Montant</Label>
          <Input
            id="income-amount"
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
          <Label htmlFor="income-date">Date</Label>
          <Input
            id="income-date"
            type="date"
            disabled={pending}
            aria-invalid={Boolean(errors.date)}
            {...register("date")}
          />
          <FieldError message={errors.date?.message} />
        </div>
      </div>

      {/* Catégorie */}
      <div className="space-y-2">
        <Label htmlFor="income-category">Catégorie</Label>
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={pending}>
              <SelectTrigger
                id="income-category"
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

      {/* Source */}
      <div className="space-y-2">
        <Label htmlFor="income-source">Source (facultatif)</Label>
        <Input
          id="income-source"
          placeholder="Ex. Employeur, client…"
          disabled={pending}
          aria-invalid={Boolean(errors.source)}
          {...register("source")}
        />
        <FieldError message={errors.source?.message} />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="income-description">Description (facultatif)</Label>
        <Textarea
          id="income-description"
          rows={2}
          placeholder="Détails complémentaires…"
          disabled={pending}
          aria-invalid={Boolean(errors.description)}
          {...register("description")}
        />
        <FieldError message={errors.description?.message} />
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
