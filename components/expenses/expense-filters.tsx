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
import { PAYMENT_METHODS } from "@/lib/config/payment-methods";
import type { ExpenseFormCategory } from "@/components/expenses/expense-form";

/** Barre de filtres et de tri des dépenses, synchronisée avec l'URL. */
export function ExpenseFilters({ categories }: { categories: ExpenseFormCategory[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") ?? "all";
  const payment = searchParams.get("payment") ?? "all";
  const period = searchParams.get("period") ?? "all";
  const sortKey = `${searchParams.get("sort") ?? "date"}-${searchParams.get("order") ?? "desc"}`;
  const min = searchParams.get("min") ?? "";
  const max = searchParams.get("max") ?? "";

  const [search, setSearch] = React.useState(searchParams.get("q") ?? "");

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

  // Recherche instantanée (debounce léger).
  React.useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (search === current) return;
    const timer = setTimeout(() => apply({ q: search || null }), 300);
    return () => clearTimeout(timer);
  }, [search, apply, searchParams]);

  const hasActiveFilters =
    category !== "all" ||
    payment !== "all" ||
    period !== "all" ||
    min !== "" ||
    max !== "" ||
    search !== "";

  function resetAll() {
    setSearch("");
    router.replace(pathname, { scroll: false });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <CategorySearch value={search} onChange={setSearch} />

        <div className="flex flex-wrap items-center gap-2">
          <Select value={category} onValueChange={(v) => apply({ category: v })}>
            <SelectTrigger className="w-[150px]" aria-label="Filtrer par catégorie">
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

          <Select value={payment} onValueChange={(v) => apply({ payment: v })}>
            <SelectTrigger className="w-[150px]" aria-label="Filtrer par mode de paiement">
              <SelectValue placeholder="Paiement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous paiements</SelectItem>
              {PAYMENT_METHODS.map((pm) => (
                <SelectItem key={pm.value} value={pm.value}>
                  {pm.label}
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
            <SelectTrigger className="w-[170px]" aria-label="Trier">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Plus récentes</SelectItem>
              <SelectItem value="date-asc">Plus anciennes</SelectItem>
              <SelectItem value="amount-desc">Montant décroissant</SelectItem>
              <SelectItem value="amount-asc">Montant croissant</SelectItem>
              <SelectItem value="title-asc">Titre (A–Z)</SelectItem>
              <SelectItem value="category-asc">Catégorie (A–Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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
