"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DeleteSavingGoalDialog } from "@/components/savings/delete-saving-goal-dialog";
import { ContributionDialog } from "@/components/savings/contribution-dialog";
import { contributionFormDefaults, type ContributionFormValues } from "@/lib/validations/saving";
import { deleteSavingGoalAction, addContributionAction } from "@/actions/savings";
import type { SavingGoalView } from "@/services/savings/saving.service";

/** Actions de la page détail d'un objectif : contribuer / éditer / supprimer. */
export function SavingGoalDetailActions({ goal }: { goal: SavingGoalView }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [confirming, setConfirming] = React.useState(false);
  const [contributing, setContributing] = React.useState(false);

  function handleContribute(values: ContributionFormValues) {
    startTransition(async () => {
      const res = await addContributionAction(goal.id, values);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Contribution ajoutée");
      setContributing(false);
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteSavingGoalAction(goal.id);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Objectif supprimé");
      router.push("/dashboard/savings");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => setContributing(true)}>
        <Plus className="h-4 w-4" />
        Contribuer
      </Button>
      <Button variant="outline" asChild>
        <Link href={`/dashboard/savings/${goal.id}/edit`}>
          <Pencil className="h-4 w-4" />
          Modifier
        </Link>
      </Button>
      <Button variant="outline" className="text-destructive" onClick={() => setConfirming(true)}>
        <Trash2 className="h-4 w-4" />
        Supprimer
      </Button>

      <ContributionDialog
        open={contributing}
        onOpenChange={setContributing}
        goalName={goal.name}
        mode="create"
        formKey={`contrib-${contributing}`}
        defaultValues={contributionFormDefaults()}
        onSubmit={handleContribute}
        pending={isPending}
      />

      <DeleteSavingGoalDialog
        goal={confirming ? goal : null}
        onOpenChange={(open) => {
          if (!open) setConfirming(false);
        }}
        onConfirm={handleDelete}
        pending={isPending}
      />
    </div>
  );
}
