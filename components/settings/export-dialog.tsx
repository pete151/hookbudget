"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { exportAccountAction } from "@/actions/settings";

/** Export complet des données du compte (JSON). */
export function ExportDialog() {
  const [busy, setBusy] = React.useState(false);

  async function handleExport() {
    setBusy(true);
    try {
      const res = await exportAccountAction();
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hookbudget-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export généré");
    } catch {
      toast.error("L'export a échoué.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-sm">
        Téléchargez l&apos;intégralité de vos données (profil, catégories, revenus, dépenses,
        budgets, objectifs) au format JSON.
      </p>
      <Button onClick={handleExport} disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        Exporter mon compte (JSON)
      </Button>
    </div>
  );
}
