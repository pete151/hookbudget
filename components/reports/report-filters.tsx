"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PERIOD_PRESETS, periodPresetBounds } from "@/lib/config/report-config";
import type { ReportFilters as Filters } from "@/domain/reports/types";
import type { IncomeFormCategory } from "@/components/income/income-form";

/** Filtres avancés d'un rapport. */
export function ReportFilters({
  filters,
  onChange,
  categories,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
  categories: IncomeFormCategory[];
}) {
  const [preset, setPreset] = React.useState("this-year");

  function set(partial: Partial<Filters>) {
    onChange({ ...filters, ...partial });
  }

  function applyPreset(value: string) {
    setPreset(value);
    if (value !== "custom") {
      const { from, to } = periodPresetBounds(value);
      set({ from, to });
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Période */}
      <div className="space-y-2">
        <Label>Période</Label>
        <Select value={preset} onValueChange={applyPreset}>
          <SelectTrigger className="w-full" aria-label="Préréglage de période">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_PRESETS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="report-from">Du</Label>
        <Input
          id="report-from"
          type="date"
          value={filters.from}
          onChange={(e) => {
            setPreset("custom");
            set({ from: e.target.value });
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="report-to">Au</Label>
        <Input
          id="report-to"
          type="date"
          value={filters.to}
          onChange={(e) => {
            setPreset("custom");
            set({ to: e.target.value });
          }}
        />
      </div>

      {/* Catégorie */}
      <div className="space-y-2">
        <Label>Catégorie</Label>
        <Select
          value={filters.categoryId ?? "all"}
          onValueChange={(v) => set({ categoryId: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="w-full" aria-label="Filtrer par catégorie">
            <SelectValue />
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
      </div>

      {/* Type de transaction */}
      <div className="space-y-2">
        <Label>Type</Label>
        <Select
          value={filters.transactionType ?? "all"}
          onValueChange={(v) => set({ transactionType: v as Filters["transactionType"] })}
        >
          <SelectTrigger className="w-full" aria-label="Type de transaction">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tout</SelectItem>
            <SelectItem value="income">Revenus</SelectItem>
            <SelectItem value="expense">Dépenses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Montants */}
      <div className="space-y-2">
        <Label>Montant (min / max)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            placeholder="Min"
            value={filters.minAmount ?? ""}
            onChange={(e) =>
              set({ minAmount: e.target.value ? Number(e.target.value) : undefined })
            }
            aria-label="Montant minimum"
          />
          <Input
            type="number"
            min="0"
            placeholder="Max"
            value={filters.maxAmount ?? ""}
            onChange={(e) =>
              set({ maxAmount: e.target.value ? Number(e.target.value) : undefined })
            }
            aria-label="Montant maximum"
          />
        </div>
      </div>
    </div>
  );
}
