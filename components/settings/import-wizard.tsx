"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { importRowSchema, type ImportRow } from "@/lib/validations/settings";
import { importTransactionsAction } from "@/actions/settings";

interface ParsedRow {
  raw: Record<string, string>;
  valid: boolean;
  row?: ImportRow;
  error?: string;
}

/** Détecte le séparateur (`,` ou `;`) et découpe une ligne CSV. */
function splitLine(line: string, delimiter: string): string[] {
  return line.split(delimiter).map((c) => c.trim().replace(/^"|"$/g, ""));
}

function parseCsv(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) return [];
  const delimiter = lines[0].includes(";") ? ";" : ",";
  const headers = splitLine(lines[0], delimiter).map((h) => h.toLowerCase());

  return lines.slice(1).map((line) => {
    const cells = splitLine(line, delimiter);
    const raw: Record<string, string> = {};
    headers.forEach((h, i) => (raw[h] = cells[i] ?? ""));

    const candidate = {
      date: raw.date ?? "",
      type: (raw.type ?? "").toLowerCase(),
      title: raw.title ?? raw.titre ?? "",
      amount: Number((raw.amount ?? raw.montant ?? "").replace(",", ".")),
      category: raw.category ?? raw.catégorie ?? undefined,
    };

    const parsed = importRowSchema.safeParse(candidate);
    if (parsed.success) return { raw, valid: true, row: parsed.data };
    return { raw, valid: false, error: parsed.error.issues[0]?.message };
  });
}

/** Assistant d'import CSV : validation + simulation + import. */
export function ImportWizard() {
  const router = useRouter();
  const [rows, setRows] = React.useState<ParsedRow[]>([]);
  const [fileName, setFileName] = React.useState("");
  const [isPending, startTransition] = React.useTransition();

  const validRows = rows.filter((r) => r.valid);
  const invalidRows = rows.filter((r) => !r.valid);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    setRows(parseCsv(text));
  }

  function handleImport() {
    if (validRows.length === 0) return;
    startTransition(async () => {
      const res = await importTransactionsAction(validRows.map((r) => r.row));
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(
        `${res.data.imported} transaction(s) importée(s), ${res.data.skipped} ignorée(s)`,
      );
      setRows([]);
      setFileName("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="import-file">Fichier CSV</Label>
        <Input
          id="import-file"
          type="file"
          accept=".csv,text/csv"
          onChange={handleFile}
          disabled={isPending}
        />
        <p className="text-muted-foreground text-xs">
          Colonnes attendues : <code>date, type, title, amount, category</code> (type = income ou
          expense).
        </p>
      </div>

      {rows.length > 0 && (
        <>
          {/* Simulation */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="text-primary h-3.5 w-3.5" />
              {validRows.length} valide(s)
            </Badge>
            {invalidRows.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                <AlertTriangle className="text-destructive h-3.5 w-3.5" />
                {invalidRows.length} en erreur
              </Badge>
            )}
            <span className="text-muted-foreground self-center text-xs">{fileName}</span>
          </div>

          <div className="border-border max-h-72 overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>État</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, 50).map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm">{r.raw.date}</TableCell>
                    <TableCell className="text-sm">{r.raw.type}</TableCell>
                    <TableCell className="text-sm">{r.raw.title ?? r.raw.titre}</TableCell>
                    <TableCell className="text-right text-sm">
                      {r.raw.amount ?? r.raw.montant}
                    </TableCell>
                    <TableCell>
                      {r.valid ? (
                        <span className="text-primary text-xs">OK</span>
                      ) : (
                        <span className="text-destructive text-xs">{r.error}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleImport} disabled={isPending || validRows.length === 0}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Importer {validRows.length} transaction(s)
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
