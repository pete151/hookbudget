"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CategorySearch } from "@/components/categories/category-search";
import {
  CategoryFilter,
  type CategorySort,
  type CategoryTypeFilter,
} from "@/components/categories/category-filter";
import { CategoryGrid } from "@/components/categories/category-grid";
import { CategoryDialog } from "@/components/categories/category-dialog";
import { DeleteCategoryDialog } from "@/components/categories/delete-category-dialog";
import { CategoryEmptyState } from "@/components/categories/category-empty-state";
import { CATEGORY_FORM_DEFAULTS, type CategoryFormValues } from "@/lib/validations/category";
import { DEFAULT_CATEGORY_COLOR } from "@/lib/config/category-colors";
import {
  archiveCategoryAction,
  createCategoryAction,
  deleteCategoryAction,
  restoreCategoryAction,
  updateCategoryAction,
} from "@/actions/categories";
import type { CategoryView } from "@/services/categories/categories.service";

/** Convertit une catégorie en valeurs de formulaire (édition). */
function toFormValues(category: CategoryView): CategoryFormValues {
  return {
    name: category.name,
    description: category.description ?? "",
    icon: category.icon ?? "tag",
    color: category.color ?? DEFAULT_CATEGORY_COLOR,
    type: category.type,
  };
}

/**
 * Vue cliente du module Catégories : recherche, filtres, tri, et pilotage des
 * boîtes de dialogue de création / édition / suppression. Les données arrivent
 * du Server Component ; après chaque mutation, `router.refresh()` recharge la
 * liste à jour.
 */
export function CategoriesClient({ categories }: { categories: CategoryView[] }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  // État de l'interface
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<CategoryTypeFilter>("all");
  const [sort, setSort] = React.useState<CategorySort>("name");
  const [showArchived, setShowArchived] = React.useState(false);

  // État des dialogues
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CategoryView | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<CategoryView | null>(null);

  const hasPersonal = categories.some((c) => !c.isSystem);
  const filtersActive = search.trim() !== "" || typeFilter !== "all";

  // Filtrage + tri (mémoïsés)
  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    const result = categories.filter((c) => {
      if (!showArchived && c.isArchived) return false;
      if (typeFilter !== "all" && c.type !== typeFilter) return false;
      if (term) {
        const haystack = `${c.name} ${c.description ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      if (sort === "usage") return b.usageCount - a.usageCount;
      if (sort === "recent") return b.createdAt.getTime() - a.createdAt.getTime();
      return a.name.localeCompare(b.name, "fr");
    });
    return result;
  }, [categories, search, typeFilter, sort, showArchived]);

  const personal = filtered.filter((c) => !c.isSystem);
  const system = filtered.filter((c) => c.isSystem);

  // ── Handlers ───────────────────────────────────────────────────────────
  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(category: CategoryView) {
    setEditing(category);
    setDialogOpen(true);
  }

  function handleSubmit(values: CategoryFormValues) {
    startTransition(async () => {
      const result = editing
        ? await updateCategoryAction(editing.id, values)
        : await createCategoryAction(values);

      if (result.success) {
        toast.success(editing ? "Catégorie mise à jour" : "Catégorie créée");
        setDialogOpen(false);
        setEditing(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleArchiveToggle(category: CategoryView) {
    startTransition(async () => {
      const result = category.isArchived
        ? await restoreCategoryAction(category.id)
        : await archiveCategoryAction(category.id);

      if (result.success) {
        toast.success(category.isArchived ? "Catégorie restaurée" : "Catégorie archivée");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    startTransition(async () => {
      const result = await deleteCategoryAction(target.id);
      if (result.success) {
        toast.success("Catégorie supprimée");
        setDeleteTarget(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Catégories</h1>
          <p className="text-muted-foreground text-sm">
            Organisez vos revenus et dépenses. Les catégories système sont fournies par défaut.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nouvelle catégorie
        </Button>
      </div>

      {/* Barre d'outils */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <CategorySearch value={search} onChange={setSearch} />
        <CategoryFilter
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          sort={sort}
          onSortChange={setSort}
          showArchived={showArchived}
          onShowArchivedChange={setShowArchived}
        />
      </div>

      {/* Mes catégories */}
      <section className="space-y-3">
        <h2 className="text-muted-foreground text-sm font-medium">Mes catégories</h2>
        {personal.length > 0 ? (
          <CategoryGrid
            categories={personal}
            onEdit={openEdit}
            onArchiveToggle={handleArchiveToggle}
            onDelete={setDeleteTarget}
          />
        ) : (
          <CategoryEmptyState
            title={
              filtersActive || (showArchived && hasPersonal)
                ? "Aucun résultat"
                : "Aucune catégorie personnelle"
            }
            description={
              filtersActive
                ? "Aucune catégorie ne correspond à votre recherche."
                : "Créez votre première catégorie personnelle avec le bouton « Nouvelle catégorie »."
            }
          />
        )}
      </section>

      {/* Catégories système */}
      {system.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-muted-foreground text-sm font-medium">Catégories système</h2>
          <CategoryGrid
            categories={system}
            onEdit={openEdit}
            onArchiveToggle={handleArchiveToggle}
            onDelete={setDeleteTarget}
          />
        </section>
      )}

      {/* Dialogues */}
      <CategoryDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        mode={editing ? "edit" : "create"}
        defaultValues={editing ? toFormValues(editing) : CATEGORY_FORM_DEFAULTS}
        onSubmit={handleSubmit}
        pending={isPending}
      />

      <DeleteCategoryDialog
        category={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        pending={isPending}
      />
    </div>
  );
}
