"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { IncomeForm, type IncomeFormCategory } from "@/components/income/income-form";
import type { IncomeFormValues } from "@/lib/validations/income";
import { updateIncomeAction } from "@/actions/income";
import type { IncomeListItem } from "@/services/income/income.service";

/** Date `Date` → `YYYY-MM-DD`. */
function toDateInput(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

/** Formulaire plein écran d'édition d'un revenu. */
export function EditIncomeForm({
  income,
  categories,
}: {
  income: IncomeListItem;
  categories: IncomeFormCategory[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const defaultValues: IncomeFormValues = {
    title: income.title,
    amount: income.amount,
    date: toDateInput(income.date),
    description: income.description ?? "",
    source: income.source ?? "",
    categoryId: income.categoryId ?? "",
  };

  function handleSubmit(values: IncomeFormValues) {
    startTransition(async () => {
      const res = await updateIncomeAction(income.id, values);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Revenu mis à jour");
      router.push(`/dashboard/income/${income.id}`);
      router.refresh();
    });
  }

  return (
    <IncomeForm
      mode="edit"
      defaultValues={defaultValues}
      categories={categories}
      onSubmit={handleSubmit}
      onCancel={() => router.push(`/dashboard/income/${income.id}`)}
      pending={isPending}
    />
  );
}
