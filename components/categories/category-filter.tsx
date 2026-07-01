"use client";

import { Archive } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";

export type CategoryTypeFilter = "all" | "income" | "expense";
export type CategorySort = "name" | "recent" | "usage";

/** Filtres et tri des catégories (type, ordre, archivées). */
export function CategoryFilter({
  typeFilter,
  onTypeFilterChange,
  sort,
  onSortChange,
  showArchived,
  onShowArchivedChange,
}: {
  typeFilter: CategoryTypeFilter;
  onTypeFilterChange: (value: CategoryTypeFilter) => void;
  sort: CategorySort;
  onSortChange: (value: CategorySort) => void;
  showArchived: boolean;
  onShowArchivedChange: (value: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={typeFilter} onValueChange={(v) => onTypeFilterChange(v as CategoryTypeFilter)}>
        <SelectTrigger className="w-[140px]" aria-label="Filtrer par type">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les types</SelectItem>
          <SelectItem value="expense">Dépenses</SelectItem>
          <SelectItem value="income">Revenus</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sort} onValueChange={(v) => onSortChange(v as CategorySort)}>
        <SelectTrigger className="w-[150px]" aria-label="Trier">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Nom (A–Z)</SelectItem>
          <SelectItem value="recent">Plus récentes</SelectItem>
          <SelectItem value="usage">Plus utilisées</SelectItem>
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant={showArchived ? "secondary" : "outline"}
        aria-pressed={showArchived}
        onClick={() => onShowArchivedChange(!showArchived)}
        className={cn("gap-2")}
      >
        <Archive className="h-4 w-4" />
        Archivées
      </Button>
    </div>
  );
}
