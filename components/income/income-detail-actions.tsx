"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DeleteIncomeDialog } from "@/components/income/delete-income-dialog";
import { deleteIncomeAction } from "@/actions/income";
import type { IncomeListItem } from "@/services/income/income.service";

/** Boutons Éditer / Supprimer de la page détail d'un revenu. */
export function IncomeDetailActions({ income }: { income: IncomeListItem }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [confirming, setConfirming] = React.useState(false);

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteIncomeAction(income.id);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Revenu supprimé");
      router.push("/dashboard/income");
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" asChild>
        <Link href={`/dashboard/income/${income.id}/edit`}>
          <Pencil className="h-4 w-4" />
          Modifier
        </Link>
      </Button>
      <Button variant="outline" className="text-destructive" onClick={() => setConfirming(true)}>
        <Trash2 className="h-4 w-4" />
        Supprimer
      </Button>

      <DeleteIncomeDialog
        income={confirming ? income : null}
        onOpenChange={(open) => {
          if (!open) setConfirming(false);
        }}
        onConfirm={handleDelete}
        pending={isPending}
      />
    </div>
  );
}
