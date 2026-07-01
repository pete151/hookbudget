"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CategorySearch } from "@/components/categories/category-search";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IncomeFormCategory } from "@/components/income/income-form";

/** Barre de filtres et de tri des revenus, synchronisée avec l'URL. */
export function IncomeFilters({ categories }: { categories: IncomeFormCategory[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") ?? "all";
  const period = searchParams.get("period") ?? "all";
  const sortKey = `${searchParams.get("sort") ?? "date"}-${searchParams.get("order") ?? "desc"}`;
  const min = searchParams.get("min") ?? "";
  const max = searchParams.get("max") ?? "";

  // Recherche locale débattue (debounce) pour éviter une navigation par frappe.
  const [search, setSearch] = React.useState(searchParams.get("q") ?? "");

  /** Applique un lot de changements de paramètres et réinitialise la page. */
  const apply = React.useCallback(
    (changes: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value === null || value === "" || value === "all") params.delete(key);
        else params.set(key, value);
      }
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  React.useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (search === current) return;
    const timer = setTimeout(() => apply({ q: search || null }), 350);
    return () => clearTimeout(timer);
  }, [search, apply, searchParams]);

  const hasActiveFilters =
    category !== "all" || period !== "all" || min !== "" || max !== "" || search !== "";

  function resetAll() {
    setSearch("");
    router.replace(pathname, { scroll: false });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <CategorySearch value={search} onChange={setSearch} />

        <div className="flex flex-wrap items-center gap-2">
          <Select value={category} onValueChange={(v) => apply({ category: v })}>
            <SelectTrigger className="w-[160px]" aria-label="Filtrer par catégorie">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={period} onValueChange={(v) => apply({ period: v })}>
            <SelectTrigger className="w-[150px]" aria-label="Filtrer par période">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toute période</SelectItem>
              <SelectItem value="month">Ce mois-ci</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortKey}
            onValueChange={(v) => {
              const [sort, order] = v.split("-");
              apply({ sort, order });
            }}
          >
            <SelectTrigger className="w-[160px]" aria-label="Trier">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Plus récents</SelectItem>
              <SelectItem value="date-asc">Plus anciens</SelectItem>
              <SelectItem value="amount-desc">Montant décroissant</SelectItem>
              <SelectItem value="amount-asc">Montant croissant</SelectItem>
              <SelectItem value="title-asc">Titre (A–Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtre par montant */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-sm">Montant :</span>
        <Input
          type="number"
          inputMode="decimal"
          min="0"
          placeholder="Min"
          defaultValue={min}
          onBlur={(e) => apply({ min: e.target.value || null })}
          aria-label="Montant minimum"
          className="h-9 w-24"
        />
        <span className="text-muted-foreground">–</span>
        <Input
          type="number"
          inputMode="decimal"
          min="0"
          placeholder="Max"
          defaultValue={max}
          onBlur={(e) => apply({ max: e.target.value || null })}
          aria-label="Montant maximum"
          className="h-9 w-24"
        />

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetAll} className="gap-1">
            <X className="h-4 w-4" />
            Réinitialiser
          </Button>
        )}
      </div>
    </div>
  );
}
