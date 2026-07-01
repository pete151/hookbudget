"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { BudgetStats } from "@/components/budgets/budget-stats";
import { BudgetChart } from "@/components/budgets/budget-chart";
import { BudgetCard } from "@/components/budgets/budget-card";
import { BudgetDialog } from "@/components/budgets/budget-dialog";
import { DeleteBudgetDialog } from "@/components/budgets/delete-budget-dialog";
import { BudgetEmptyState } from "@/components/budgets/budget-empty-state";
import type { BudgetFormCategory } from "@/components/budgets/budget-form";
import { budgetFormDefaults, type BudgetFormValues } from "@/lib/validations/budget";
import { createBudgetAction, updateBudgetAction, deleteBudgetAction } from "@/actions/budgets";
import type { BudgetCharts, BudgetStatistics, BudgetView } from "@/services/budgets/budget.service";

function toDateInput(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function toFormValues(budget: BudgetView): BudgetFormValues {
  return {
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
}

export function BudgetsClient({
  budgets,
  stats,
  charts,
  categories,
  currency,
}: {
  budgets: BudgetView[];
  stats: BudgetStatistics;
  charts: BudgetCharts;
  categories: BudgetFormCategory[];
  currency: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<BudgetView | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<BudgetView | null>(null);
  const [resetNonce, setResetNonce] = React.useState(0);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(budget: BudgetView) {
    setEditing(budget);
    setDialogOpen(true);
  }

  function handleSubmit(values: BudgetFormValues, addAnother: boolean) {
    startTransition(async () => {
      const res = editing
        ? await updateBudgetAction(editing.id, values)
        : await createBudgetAction(values);

      if (!res.success) {
        toast.error(res.error);
        return;
      }

      toast.success(editing ? "Budget mis à jour" : "Budget créé");
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
      const res = await deleteBudgetAction(target.id);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Budget supprimé");
      setDeleteTarget(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground text-sm">
            Définissez des enveloppes et suivez automatiquement leur consommation.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nouveau budget
        </Button>
      </div>

      <BudgetStats stats={stats} currency={currency} />
      <BudgetChart charts={charts} currency={currency} />

      {budgets.length === 0 ? (
        <BudgetEmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              currency={currency}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <BudgetDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        mode={editing ? "edit" : "create"}
        formKey={editing ? editing.id : `create-${resetNonce}`}
        defaultValues={editing ? toFormValues(editing) : budgetFormDefaults()}
        categories={categories}
        onSubmit={handleSubmit}
        pending={isPending}
      />

      <DeleteBudgetDialog
        budget={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        pending={isPending}
      />
    </div>
  );
}
