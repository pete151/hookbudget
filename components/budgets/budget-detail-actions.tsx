"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DeleteBudgetDialog } from "@/components/budgets/delete-budget-dialog";
import { deleteBudgetAction } from "@/actions/budgets";
import type { BudgetView } from "@/services/budgets/budget.service";

/** Boutons Éditer / Supprimer de la page détail d'un budget. */
export function BudgetDetailActions({ budget }: { budget: BudgetView }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [confirming, setConfirming] = React.useState(false);

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteBudgetAction(budget.id);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Budget supprimé");
      router.push("/dashboard/budgets");
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" asChild>
        <Link href={`/dashboard/budgets/${budget.id}/edit`}>
          <Pencil className="h-4 w-4" />
          Modifier
        </Link>
      </Button>
      <Button variant="outline" className="text-destructive" onClick={() => setConfirming(true)}>
        <Trash2 className="h-4 w-4" />
        Supprimer
      </Button>

      <DeleteBudgetDialog
        budget={confirming ? budget : null}
        onOpenChange={(open) => {
          if (!open) setConfirming(false);
        }}
        onConfirm={handleDelete}
        pending={isPending}
      />
    </div>
  );
}
