"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/auth/form-parts";
import { contributionSchema, type ContributionFormValues } from "@/lib/validations/saving";

/** Formulaire d'une contribution (versement) à un objectif. */
export function ContributionForm({
  defaultValues,
  onSubmit,
  onCancel,
  pending,
}: {
  defaultValues: ContributionFormValues;
  onSubmit: (values: ContributionFormValues) => void;
  onCancel: () => void;
  pending: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionSchema),
    mode: "onBlur",
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v))} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contribution-amount">Montant</Label>
          <Input
            id="contribution-amount"
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

        <div className="space-y-2">
          <Label htmlFor="contribution-date">Date</Label>
          <Input
            id="contribution-date"
            type="date"
            disabled={pending}
            aria-invalid={Boolean(errors.contributionDate)}
            {...register("contributionDate")}
          />
          <FieldError message={errors.contributionDate?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contribution-note">Note (facultatif)</Label>
        <Textarea
          id="contribution-note"
          rows={2}
          placeholder="Origine du versement…"
          disabled={pending}
          aria-invalid={Boolean(errors.note)}
          {...register("note")}
        />
        <FieldError message={errors.note?.message} />
      </div>

      <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          Annuler
        </Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
