"use client";

import * as React from "react";
import { FileText, FileSpreadsheet, FileType, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { EXPORT_FORMATS } from "@/lib/config/report-config";
import { exportReport } from "@/lib/reports/export";
import { saveReportAction } from "@/actions/reports";
import type { ExportFormat, ReportData, ReportFilters } from "@/domain/reports/types";

const ICONS: Record<ExportFormat, typeof FileText> = {
  CSV: FileText,
  XLSX: FileSpreadsheet,
  PDF: FileType,
};

/** Boîte de dialogue de choix du format et d'export du rapport. */
export function ExportDialog({
  open,
  onOpenChange,
  data,
  filters,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ReportData | null;
  filters: ReportFilters;
}) {
  const [format, setFormat] = React.useState<ExportFormat>("PDF");
  const [busy, setBusy] = React.useState(false);

  async function handleExport() {
    if (!data) return;
    setBusy(true);
    try {
      await exportReport(data, format);
      await saveReportAction({ type: data.meta.type, filters, format });
      toast.success(`Export ${format} généré`);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("L'export a échoué.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exporter le rapport</DialogTitle>
          <DialogDescription>Choisissez un format d&apos;export.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          {EXPORT_FORMATS.map((f) => {
            const Icon = ICONS[f.value];
            const selected = format === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setFormat(f.value)}
                aria-pressed={selected}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                  "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                  selected ? "border-primary bg-accent" : "border-border hover:bg-accent/50",
                )}
              >
                <Icon className="text-muted-foreground h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">{f.label}</p>
                  <p className="text-muted-foreground text-xs">{f.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Annuler
          </Button>
          <Button onClick={handleExport} disabled={busy || !data}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Exporter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
