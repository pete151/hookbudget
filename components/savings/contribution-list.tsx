"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Loader2, Coins } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ContributionDialog } from "@/components/savings/contribution-dialog";
import { EmptyState } from "@/components/dashboard/empty-state";
import { cn } from "@/lib/utils/cn";
import { buttonVariants } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { ContributionFormValues } from "@/lib/validations/saving";
import { updateContributionAction, deleteContributionAction } from "@/actions/savings";
import type { ContributionView } from "@/services/savings/saving.service";

function toDateInput(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

/** Liste des contributions d'un objectif, avec édition et suppression. */
export function ContributionList({
  contributions,
  goalName,
  currency,
}: {
  contributions: ContributionView[];
  goalName: string;
  currency: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [editing, setEditing] = React.useState<ContributionView | null>(null);
  const [deleting, setDeleting] = React.useState<ContributionView | null>(null);

  function handleUpdate(values: ContributionFormValues) {
    if (!editing) return;
    const id = editing.id;
    startTransition(async () => {
      const res = await updateContributionAction(id, values);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Contribution mise à jour");
      setEditing(null);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!deleting) return;
    const id = deleting.id;
    startTransition(async () => {
      const res = await deleteContributionAction(id);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Contribution supprimée");
      setDeleting(null);
      router.refresh();
    });
  }

  if (contributions.length === 0) {
    return (
      <EmptyState
        icon={Coins}
        title="Aucune contribution"
        description="Ajoutez une contribution pour faire progresser cet objectif."
      />
    );
  }

  return (
    <>
      <ul className="divide-border divide-y">
        {contributions.map((c) => (
          <li key={c.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{formatCurrency(c.amount, currency)}</p>
              <p className="text-muted-foreground truncate text-xs">
                {formatDate(c.contributionDate)}
                {c.note ? ` · ${c.note}` : ""}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Modifier"
              onClick={() => setEditing(c)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive h-8 w-8"
              aria-label="Supprimer"
              onClick={() => setDeleting(c)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>

      {/* Édition */}
      <ContributionDialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        goalName={goalName}
        mode="edit"
        formKey={editing?.id ?? "none"}
        defaultValues={
          editing
            ? {
                amount: editing.amount,
                contributionDate: toDateInput(editing.contributionDate),
                note: editing.note ?? "",
              }
            : { amount: 0, contributionDate: "", note: "" }
        }
        onSubmit={handleUpdate}
        pending={isPending}
      />

      {/* Suppression */}
      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette contribution ?</AlertDialogTitle>
            <AlertDialogDescription>
              Ce versement sera retiré et la progression de l&apos;objectif recalculée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isPending}
              className={cn(buttonVariants({ variant: "destructive" }))}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
