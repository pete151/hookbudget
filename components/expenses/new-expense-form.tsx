"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ExpenseForm, type ExpenseFormCategory } from "@/components/expenses/expense-form";
import { expenseFormDefaults, type ExpenseFormValues } from "@/lib/validations/expense";
import { createExpenseAction } from "@/actions/expenses";

/** Formulaire plein écran de création d'une dépense. */
export function NewExpenseForm({ categories }: { categories: ExpenseFormCategory[] }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [resetNonce, setResetNonce] = React.useState(0);

  function handleSubmit(values: ExpenseFormValues, addAnother: boolean) {
    startTransition(async () => {
      const res = await createExpenseAction(values);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Dépense ajoutée");
      if (addAnother) {
        setResetNonce((n) => n + 1);
      } else {
        router.push("/dashboard/expenses");
        router.refresh();
      }
    });
  }

  return (
    <ExpenseForm
      key={resetNonce}
      mode="create"
      defaultValues={expenseFormDefaults()}
      categories={categories}
      onSubmit={handleSubmit}
      onCancel={() => router.push("/dashboard/expenses")}
      pending={isPending}
    />
  );
}
