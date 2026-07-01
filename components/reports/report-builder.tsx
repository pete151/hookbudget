"use client";

import * as React from "react";
import { FileBarChart, Loader2, Download } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportFilters } from "@/components/reports/report-filters";
import { ReportPreview } from "@/components/reports/report-preview";
import { ExportDialog } from "@/components/reports/export-dialog";
import { EmptyState } from "@/components/dashboard/empty-state";
import { REPORT_TYPES, periodPresetBounds } from "@/lib/config/report-config";
import { generateReportAction } from "@/actions/reports";
import type { ReportData, ReportFilters as Filters, ReportKind } from "@/domain/reports/types";
import type { IncomeFormCategory } from "@/components/income/income-form";

/** Assistant de création de rapport : type, filtres, aperçu et export. */
export function ReportBuilder({
  categories,
  currency,
  defaultType = "SUMMARY",
}: {
  categories: IncomeFormCategory[];
  currency: string;
  defaultType?: ReportKind;
}) {
  const [type, setType] = React.useState<ReportKind>(defaultType);
  const [filters, setFilters] = React.useState<Filters>(() => ({
    ...periodPresetBounds("this-year"),
    transactionType: "all",
  }));
  const [data, setData] = React.useState<ReportData | null>(null);
  const [isGenerating, startTransition] = React.useTransition();
  const [exportOpen, setExportOpen] = React.useState(false);

  function handleGenerate() {
    startTransition(async () => {
      const res = await generateReportAction({ type, filters });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      setData(res.data);
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assistant de rapport</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Type de rapport</Label>
            <Select value={type} onValueChange={(v) => setType(v as ReportKind)}>
              <SelectTrigger className="w-full sm:w-72" aria-label="Type de rapport">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ReportFilters filters={filters} onChange={setFilters} categories={categories} />

          <div className="flex flex-wrap justify-end gap-2">
            {data && (
              <Button variant="outline" onClick={() => setExportOpen(true)} disabled={isGenerating}>
                <Download className="h-4 w-4" />
                Exporter
              </Button>
            )}
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileBarChart className="h-4 w-4" />
              )}
              {isGenerating ? "Génération…" : "Générer le rapport"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isGenerating ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      ) : data ? (
        <ReportPreview data={data} currency={currency} />
      ) : (
        <EmptyState
          icon={FileBarChart}
          title="Aucun aperçu"
          description="Choisissez un type et une période, puis générez le rapport."
          className="py-14"
        />
      )}

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} data={data} filters={filters} />
    </div>
  );
}
