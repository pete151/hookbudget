"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ExpenseForm, type ExpenseFormCategory } from "@/components/expenses/expense-form";
import type { ExpenseFormValues } from "@/lib/validations/expense";
import { updateExpenseAction } from "@/actions/expenses";
import type { ExpenseListItem } from "@/services/expenses/expense.service";

function toDateInput(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

/** Formulaire plein écran d'édition d'une dépense. */
export function EditExpenseForm({
  expense,
  categories,
}: {
  expense: ExpenseListItem;
  categories: ExpenseFormCategory[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const defaultValues: ExpenseFormValues = {
    title: expense.title,
    amount: expense.amount,
    date: toDateInput(expense.date),
    categoryId: expense.categoryId ?? "",
    paymentMethod: expense.paymentMethod,
    description: expense.description ?? "",
    notes: expense.notes ?? "",
    attachmentUrl: expense.attachmentUrl ?? "",
    isRecurring: expense.isRecurring,
    frequency: expense.frequency ?? "MONTHLY",
  };

  function handleSubmit(values: ExpenseFormValues) {
    startTransition(async () => {
      const res = await updateExpenseAction(expense.id, values);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Dépense mise à jour");
      router.push(`/dashboard/expenses/${expense.id}`);
      router.refresh();
    });
  }

  return (
    <ExpenseForm
      mode="edit"
      defaultValues={defaultValues}
      categories={categories}
      onSubmit={handleSubmit}
      onCancel={() => router.push(`/dashboard/expenses/${expense.id}`)}
      pending={isPending}
    />
  );
}
