"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { SavingGoalStats } from "@/components/savings/saving-goal-stats";
import { SavingGoalChart } from "@/components/savings/saving-goal-chart";
import { SavingGoalCard } from "@/components/savings/saving-goal-card";
import { SavingGoalDialog } from "@/components/savings/saving-goal-dialog";
import { ContributionDialog } from "@/components/savings/contribution-dialog";
import { DeleteSavingGoalDialog } from "@/components/savings/delete-saving-goal-dialog";
import { SavingGoalEmptyState } from "@/components/savings/saving-goal-empty-state";
import {
  savingGoalFormDefaults,
  contributionFormDefaults,
  type SavingGoalFormValues,
  type ContributionFormValues,
} from "@/lib/validations/saving";
import {
  createSavingGoalAction,
  updateSavingGoalAction,
  deleteSavingGoalAction,
  addContributionAction,
} from "@/actions/savings";
import type {
  SavingCharts,
  SavingGoalView,
  SavingsStatistics,
} from "@/services/savings/saving.service";

function toDateInput(date: Date | null): string {
  if (!date) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function toGoalFormValues(goal: SavingGoalView): SavingGoalFormValues {
  return {
    name: goal.name,
    description: goal.description ?? "",
    targetAmount: goal.targetAmount,
    targetDate: toDateInput(goal.targetDate),
    priority: goal.priority,
    color: goal.color ?? "#22c55e",
    icon: goal.icon ?? "target",
  };
}

export function SavingsClient({
  goals,
  stats,
  charts,
  currency,
}: {
  goals: SavingGoalView[];
  stats: SavingsStatistics;
  charts: SavingCharts;
  currency: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const [goalDialogOpen, setGoalDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SavingGoalView | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<SavingGoalView | null>(null);
  const [contributeTarget, setContributeTarget] = React.useState<SavingGoalView | null>(null);
  const [resetNonce, setResetNonce] = React.useState(0);

  function openCreate() {
    setEditing(null);
    setGoalDialogOpen(true);
  }

  function handleGoalSubmit(values: SavingGoalFormValues, addAnother: boolean) {
    startTransition(async () => {
      const res = editing
        ? await updateSavingGoalAction(editing.id, values)
        : await createSavingGoalAction(values);

      if (!res.success) {
        toast.error(res.error);
        return;
      }

      toast.success(editing ? "Objectif mis à jour" : "Objectif créé");
      router.refresh();

      if (addAnother && !editing) {
        setResetNonce((n) => n + 1);
      } else {
        setGoalDialogOpen(false);
        setEditing(null);
      }
    });
  }

  function handleContribute(values: ContributionFormValues) {
    if (!contributeTarget) return;
    const goalId = contributeTarget.id;
    startTransition(async () => {
      const res = await addContributionAction(goalId, values);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Contribution ajoutée");
      setContributeTarget(null);
      router.refresh();
    });
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    startTransition(async () => {
      const res = await deleteSavingGoalAction(target.id);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Objectif supprimé");
      setDeleteTarget(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Objectifs d&apos;épargne</h1>
          <p className="text-muted-foreground text-sm">
            Définissez des objectifs et suivez votre progression contribution après contribution.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nouvel objectif
        </Button>
      </div>

      <SavingGoalStats stats={stats} currency={currency} />
      <SavingGoalChart charts={charts} currency={currency} />

      {goals.length === 0 ? (
        <SavingGoalEmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {goals.map((goal) => (
            <SavingGoalCard
              key={goal.id}
              goal={goal}
              currency={currency}
              onEdit={(g) => {
                setEditing(g);
                setGoalDialogOpen(true);
              }}
              onDelete={setDeleteTarget}
              onContribute={setContributeTarget}
            />
          ))}
        </div>
      )}

      <SavingGoalDialog
        open={goalDialogOpen}
        onOpenChange={(open) => {
          setGoalDialogOpen(open);
          if (!open) setEditing(null);
        }}
        mode={editing ? "edit" : "create"}
        formKey={editing ? editing.id : `create-${resetNonce}`}
        defaultValues={editing ? toGoalFormValues(editing) : savingGoalFormDefaults()}
        onSubmit={handleGoalSubmit}
        pending={isPending}
      />

      <ContributionDialog
        open={contributeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setContributeTarget(null);
        }}
        goalName={contributeTarget?.name ?? ""}
        mode="create"
        formKey={contributeTarget?.id ?? "none"}
        defaultValues={contributionFormDefaults()}
        onSubmit={handleContribute}
        pending={isPending}
      />

      <DeleteSavingGoalDialog
        goal={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        pending={isPending}
      />
    </div>
  );
}
