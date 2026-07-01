"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DeleteExpenseDialog } from "@/components/expenses/delete-expense-dialog";
import { deleteExpenseAction } from "@/actions/expenses";
import type { ExpenseListItem } from "@/services/expenses/expense.service";

/** Boutons Éditer / Supprimer de la page détail d'une dépense. */
export function ExpenseDetailActions({ expense }: { expense: ExpenseListItem }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [confirming, setConfirming] = React.useState(false);

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteExpenseAction(expense.id);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Dépense supprimée");
      router.push("/dashboard/expenses");
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" asChild>
        <Link href={`/dashboard/expenses/${expense.id}/edit`}>
          <Pencil className="h-4 w-4" />
          Modifier
        </Link>
      </Button>
      <Button variant="outline" className="text-destructive" onClick={() => setConfirming(true)}>
        <Trash2 className="h-4 w-4" />
        Supprimer
      </Button>

      <DeleteExpenseDialog
        expense={confirming ? expense : null}
        onOpenChange={(open) => {
          if (!open) setConfirming(false);
        }}
        onConfirm={handleDelete}
        pending={isPending}
      />
    </div>
  );
}
