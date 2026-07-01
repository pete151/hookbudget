"use client";

import * as React from "react";
import { Download, Trash2, Loader2, History } from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { formatDate } from "@/lib/utils/format";
import { REPORT_TYPE_LABELS } from "@/lib/config/report-config";
import { exportReport } from "@/lib/reports/export";
import { generateReportAction, deleteReportAction } from "@/actions/reports";
import type { ReportHistoryItem } from "@/services/reports/report.service";
import type { ReportFilters, ReportKind } from "@/domain/reports/types";

/** Historique des rapports générés, avec re-téléchargement. */
export function ReportHistory({ items }: { items: ReportHistoryItem[] }) {
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  async function handleDownload(item: ReportHistoryItem) {
    if (!item.filters) {
      toast.error("Filtres indisponibles pour ce rapport.");
      return;
    }
    setBusyId(item.id);
    try {
      const res = await generateReportAction({
        type: item.type as ReportKind,
        filters: item.filters as ReportFilters,
      });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      await exportReport(res.data, item.format);
      toast.success("Rapport téléchargé");
    } catch {
      toast.error("Le téléchargement a échoué.");
    } finally {
      setBusyId(null);
    }
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await deleteReportAction(id);
      if (!res.success) toast.error(res.error);
      else toast.success("Entrée supprimée");
    });
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="Aucun rapport"
        description="Les rapports que vous exportez apparaîtront ici."
        actionLabel="Créer un rapport"
        actionHref="/dashboard/reports/new"
        className="py-14"
      />
    );
  }

  return (
    <div className="border-border rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Période</TableHead>
            <TableHead>Format</TableHead>
            <TableHead className="w-[120px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(item.createdAt)}
              </TableCell>
              <TableCell className="font-medium">
                {REPORT_TYPE_LABELS[item.type as ReportKind]}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(item.periodStart)} → {formatDate(item.periodEnd)}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-normal">
                  {item.format}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Télécharger"
                    disabled={busyId === item.id}
                    onClick={() => handleDownload(item)}
                  >
                    {busyId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive h-8 w-8"
                    aria-label="Supprimer"
                    disabled={isPending}
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
