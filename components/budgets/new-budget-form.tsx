"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { BudgetForm, type BudgetFormCategory } from "@/components/budgets/budget-form";
import { budgetFormDefaults, type BudgetFormValues } from "@/lib/validations/budget";
import { createBudgetAction } from "@/actions/budgets";

/** Formulaire plein écran de création d'un budget. */
export function NewBudgetForm({ categories }: { categories: BudgetFormCategory[] }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [resetNonce, setResetNonce] = React.useState(0);

  function handleSubmit(values: BudgetFormValues, addAnother: boolean) {
    startTransition(async () => {
      const res = await createBudgetAction(values);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Budget créé");
      if (addAnother) {
        setResetNonce((n) => n + 1);
      } else {
        router.push("/dashboard/budgets");
        router.refresh();
      }
    });
  }

  return (
    <BudgetForm
      key={resetNonce}
      mode="create"
      defaultValues={budgetFormDefaults()}
      categories={categories}
      onSubmit={handleSubmit}
      onCancel={() => router.push("/dashboard/budgets")}
      pending={isPending}
    />
  );
}
