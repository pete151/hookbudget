"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ExpenseStats } from "@/components/expenses/expense-stats";
import { ExpenseChart } from "@/components/expenses/expense-chart";
import { ExpenseFilters } from "@/components/expenses/expense-filters";
import { ExpenseTable } from "@/components/expenses/expense-table";
import { ExpenseCard } from "@/components/expenses/expense-card";
import { ExpenseDialog } from "@/components/expenses/expense-dialog";
import { DeleteExpenseDialog } from "@/components/expenses/delete-expense-dialog";
import { ExpenseEmptyState } from "@/components/expenses/expense-empty-state";
import type { ExpenseFormCategory } from "@/components/expenses/expense-form";
import { expenseFormDefaults, type ExpenseFormValues } from "@/lib/validations/expense";
import { createExpenseAction, updateExpenseAction, deleteExpenseAction } from "@/actions/expenses";
import type {
  ExpenseCharts,
  ExpenseListItem,
  ExpenseListResult,
  ExpenseStatistics,
} from "@/services/expenses/expense.service";

function toDateInput(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function toFormValues(expense: ExpenseListItem): ExpenseFormValues {
  return {
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
}

export function ExpenseClient({
  result,
  stats,
  charts,
  categories,
  currency,
}: {
  result: ExpenseListResult;
  stats: ExpenseStatistics;
  charts: ExpenseCharts;
  categories: ExpenseFormCategory[];
  currency: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ExpenseListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<ExpenseListItem | null>(null);
  const [resetNonce, setResetNonce] = React.useState(0);

  const filtersActive = ["q", "category", "payment", "period", "min", "max"].some((k) =>
    searchParams.has(k),
  );

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(expense: ExpenseListItem) {
    setEditing(expense);
    setDialogOpen(true);
  }

  function handleSubmit(values: ExpenseFormValues, addAnother: boolean) {
    startTransition(async () => {
      const res = editing
        ? await updateExpenseAction(editing.id, values)
        : await createExpenseAction(values);

      if (!res.success) {
        toast.error(res.error);
        return;
      }

      toast.success(editing ? "Dépense mise à jour" : "Dépense ajoutée");
      router.refresh();

      if (addAnother && !editing) {
        setResetNonce((n) => n + 1);
      } else {
        setDialogOpen(false);
        setEditing(null);
      }
    });
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    startTransition(async () => {
      const res = await deleteExpenseAction(target.id);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Dépense supprimée");
      setDeleteTarget(null);
      router.refresh();
    });
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dépenses</h1>
          <p className="text-muted-foreground text-sm">
            Suivez et gérez toutes vos sorties d&apos;argent.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Ajouter une dépense
        </Button>
      </div>

      <ExpenseStats stats={stats} currency={currency} />
      <ExpenseChart charts={charts} currency={currency} />
      <ExpenseFilters categories={categories} />

      {result.items.length === 0 ? (
        <ExpenseEmptyState filtered={filtersActive} />
      ) : (
        <>
          <div className="hidden md:block">
            <ExpenseTable
              items={result.items}
              currency={currency}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          </div>
          <div className="space-y-3 md:hidden">
            {result.items.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                currency={currency}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>

          {result.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Page {result.page} sur {result.totalPages} · {result.total} dépense
                {result.total > 1 ? "s" : ""}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={result.page <= 1}
                  onClick={() => goToPage(result.page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={result.page >= result.totalPages}
                  onClick={() => goToPage(result.page + 1)}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <ExpenseDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        mode={editing ? "edit" : "create"}
        formKey={editing ? editing.id : `create-${resetNonce}`}
        defaultValues={editing ? toFormValues(editing) : expenseFormDefaults()}
        categories={categories}
        onSubmit={handleSubmit}
        pending={isPending}
      />

      <DeleteExpenseDialog
        expense={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        pending={isPending}
      />
    </div>
  );
}
