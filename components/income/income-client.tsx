"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { IncomeStats } from "@/components/income/income-stats";
import { IncomeChart } from "@/components/income/income-chart";
import { IncomeFilters } from "@/components/income/income-filters";
import { IncomeTable } from "@/components/income/income-table";
import { IncomeCard } from "@/components/income/income-card";
import { IncomeDialog } from "@/components/income/income-dialog";
import { DeleteIncomeDialog } from "@/components/income/delete-income-dialog";
import { IncomeEmptyState } from "@/components/income/income-empty-state";
import type { IncomeFormCategory } from "@/components/income/income-form";
import { incomeFormDefaults, type IncomeFormValues } from "@/lib/validations/income";
import { createIncomeAction, updateIncomeAction, deleteIncomeAction } from "@/actions/income";
import type {
  IncomeCharts,
  IncomeListItem,
  IncomeListResult,
  IncomeStatistics,
} from "@/services/income/income.service";

/** Date `Date` → chaîne `YYYY-MM-DD` pour l'input date. */
function toDateInput(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function toFormValues(income: IncomeListItem): IncomeFormValues {
  return {
    title: income.title,
    amount: income.amount,
    date: toDateInput(income.date),
    description: income.description ?? "",
    source: income.source ?? "",
    categoryId: income.categoryId ?? "",
  };
}

export function IncomeClient({
  result,
  stats,
  charts,
  categories,
  currency,
}: {
  result: IncomeListResult;
  stats: IncomeStatistics;
  charts: IncomeCharts;
  categories: IncomeFormCategory[];
  currency: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<IncomeListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<IncomeListItem | null>(null);
  const [resetNonce, setResetNonce] = React.useState(0);

  const filtersActive = ["q", "category", "period", "min", "max"].some((k) => searchParams.has(k));

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(income: IncomeListItem) {
    setEditing(income);
    setDialogOpen(true);
  }

  function handleSubmit(values: IncomeFormValues, addAnother: boolean) {
    startTransition(async () => {
      const res = editing
        ? await updateIncomeAction(editing.id, values)
        : await createIncomeAction(values);

      if (!res.success) {
        toast.error(res.error);
        return;
      }

      toast.success(editing ? "Revenu mis à jour" : "Revenu ajouté");
      router.refresh();

      if (addAnother && !editing) {
        setResetNonce((n) => n + 1); // réinitialise le formulaire pour une nouvelle saisie
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
      const res = await deleteIncomeAction(target.id);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Revenu supprimé");
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
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Revenus</h1>
          <p className="text-muted-foreground text-sm">
            Suivez et gérez toutes vos rentrées d&apos;argent.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Ajouter un revenu
        </Button>
      </div>

      {/* Statistiques */}
      <IncomeStats stats={stats} currency={currency} />

      {/* Graphiques */}
      <IncomeChart charts={charts} currency={currency} />

      {/* Filtres */}
      <IncomeFilters categories={categories} />

      {/* Liste */}
      {result.items.length === 0 ? (
        <IncomeEmptyState filtered={filtersActive} />
      ) : (
        <>
          {/* Desktop : tableau */}
          <div className="hidden md:block">
            <IncomeTable
              items={result.items}
              currency={currency}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          </div>
          {/* Mobile : cartes */}
          <div className="space-y-3 md:hidden">
            {result.items.map((income) => (
              <IncomeCard
                key={income.id}
                income={income}
                currency={currency}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>

          {/* Pagination */}
          {result.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Page {result.page} sur {result.totalPages} · {result.total} revenu
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

      {/* Dialogues */}
      <IncomeDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        mode={editing ? "edit" : "create"}
        formKey={editing ? editing.id : `create-${resetNonce}`}
        defaultValues={editing ? toFormValues(editing) : incomeFormDefaults()}
        categories={categories}
        onSubmit={handleSubmit}
        pending={isPending}
      />

      <DeleteIncomeDialog
        income={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        pending={isPending}
      />
    </div>
  );
}
