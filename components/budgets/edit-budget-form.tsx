"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { BudgetForm, type BudgetFormCategory } from "@/components/budgets/budget-form";
import type { BudgetFormValues } from "@/lib/validations/budget";
import { updateBudgetAction } from "@/actions/budgets";
import type { BudgetView } from "@/services/budgets/budget.service";

function toDateInput(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

/** Formulaire plein écran d'édition d'un budget. */
export function EditBudgetForm({
  budget,
  categories,
}: {
  budget: BudgetView;
  categories: BudgetFormCategory[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const defaultValues: BudgetFormValues = {
    name: budget.name,
    description: budget.description ?? "",
    amount: budget.amount,
    budgetType: budget.budgetType,
    period: budget.period,
    startDate: toDateInput(budget.startDate),
    endDate: toDateInput(budget.endDate),
    categoryId: budget.categoryId ?? "",
    isActive: budget.isActive,
    alert50: budget.alert50,
    alert80: budget.alert80,
    alert100: budget.alert100,
  };

  function handleSubmit(values: BudgetFormValues) {
    startTransition(async () => {
      const res = await updateBudgetAction(budget.id, values);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Budget mis à jour");
      router.push(`/dashboard/budgets/${budget.id}`);
      router.refresh();
    });
  }

  return (
    <BudgetForm
      mode="edit"
      defaultValues={defaultValues}
      categories={categories}
      onSubmit={handleSubmit}
      onCancel={() => router.push(`/dashboard/budgets/${budget.id}`)}
      pending={isPending}
    />
  );
}
