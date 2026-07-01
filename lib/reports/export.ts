import { formatCurrency } from "@/lib/utils/format";
import type { ReportData } from "@/domain/reports/types";

/**
 * Utilitaires d'export de rapports (CSV, XLSX, PDF).
 * Les bibliothèques lourdes (xlsx, jspdf) sont importées dynamiquement pour
 * n'être chargées qu'au moment de l'export.
 */

function fileBase(data: ReportData): string {
  return `hookbudget-${data.meta.type.toLowerCase()}-${data.meta.from}_${data.meta.to}`;
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── CSV ────────────────────────────────────────────────────────────────────

function csvEscape(value: string | number): string {
  const s = String(value);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function exportCsv(data: ReportData): void {
  const rows: (string | number)[][] = [];
  rows.push(["HookBudget —", data.meta.title]);
  rows.push(["Période", data.meta.periodLabel]);
  rows.push([]);
  rows.push(["Résumé"]);
  rows.push(["Revenus", data.summary.income]);
  rows.push(["Dépenses", data.summary.expense]);
  rows.push(["Solde", data.summary.balance]);
  rows.push(["Épargne", data.summary.savings]);
  rows.push([]);
  rows.push(["Transactions"]);
  rows.push(["Date", "Titre", "Type", "Catégorie", "Montant"]);
  for (const t of data.transactions) {
    rows.push([t.date, t.title, t.type === "income" ? "Revenu" : "Dépense", t.category, t.amount]);
  }

  const csv = rows.map((r) => r.map(csvEscape).join(";")).join("\n");
  download(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }), `${fileBase(data)}.csv`);
}

// ── XLSX ───────────────────────────────────────────────────────────────────

export async function exportXlsx(data: ReportData): Promise<void> {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();

  const summary = XLSX.utils.aoa_to_sheet([
    ["Rapport", data.meta.title],
    ["Période", data.meta.periodLabel],
    ["Utilisateur", data.meta.user.name],
    [],
    ["Revenus", data.summary.income],
    ["Dépenses", data.summary.expense],
    ["Solde", data.summary.balance],
    ["Épargne", data.summary.savings],
    ["Taux d'épargne (%)", data.summary.savingsRate],
  ]);
  XLSX.utils.book_append_sheet(wb, summary, "Résumé");

  const tx = XLSX.utils.json_to_sheet(
    data.transactions.map((t) => ({
      Date: t.date,
      Titre: t.title,
      Type: t.type === "income" ? "Revenu" : "Dépense",
      Catégorie: t.category,
      Montant: t.amount,
    })),
  );
  XLSX.utils.book_append_sheet(wb, tx, "Transactions");

  const cats = XLSX.utils.json_to_sheet([
    ...data.incomeByCategory.map((c) => ({
      Type: "Revenu",
      Catégorie: c.name,
      Montant: c.value,
      "%": c.percent,
    })),
    ...data.expenseByCategory.map((c) => ({
      Type: "Dépense",
      Catégorie: c.name,
      Montant: c.value,
      "%": c.percent,
    })),
  ]);
  XLSX.utils.book_append_sheet(wb, cats, "Catégories");

  XLSX.writeFile(wb, `${fileBase(data)}.xlsx`);
}

// ── PDF ────────────────────────────────────────────────────────────────────

export async function exportPdf(data: ReportData): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();
  const currency = data.meta.currency;
  const money = (n: number) => formatCurrency(n, currency);

  // En-tête : logo (texte) + titre
  doc.setFillColor(34, 197, 94);
  doc.rect(14, 12, 8, 8, "F");
  doc.setFontSize(18);
  doc.setTextColor(20);
  doc.text("HookBudget", 26, 19);
  doc.setFontSize(13);
  doc.text(data.meta.title, 14, 30);

  // Infos utilisateur + période
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(`${data.meta.user.name} · ${data.meta.user.email}`, 14, 37);
  doc.text(`Période : ${data.meta.periodLabel}`, 14, 42);

  // Résumé
  autoTable(doc, {
    startY: 48,
    head: [["Résumé", "Montant"]],
    body: [
      ["Revenus", money(data.summary.income)],
      ["Dépenses", money(data.summary.expense)],
      ["Solde", money(data.summary.balance)],
      ["Épargne", money(data.summary.savings)],
      ["Taux d'épargne", `${data.summary.savingsRate} %`],
    ],
    theme: "striped",
    headStyles: { fillColor: [34, 197, 94] },
  });

  // Graphique simple : barres des dépenses par catégorie
  const expenses = data.expenseByCategory.slice(0, 6);
  if (expenses.length > 0) {
    // @ts-expect-error lastAutoTable est ajouté par le plugin
    let y = (doc.lastAutoTable?.finalY ?? 60) + 10;
    doc.setFontSize(11);
    doc.setTextColor(20);
    doc.text("Dépenses par catégorie", 14, y);
    y += 4;
    const max = Math.max(...expenses.map((e) => e.value), 1);
    for (const e of expenses) {
      y += 8;
      const w = Math.max(2, (e.value / max) * 120);
      doc.setFillColor(139, 92, 246);
      doc.rect(14, y - 4, w, 5, "F");
      doc.setFontSize(8);
      doc.setTextColor(70);
      doc.text(`${e.name} — ${money(e.value)} (${e.percent}%)`, 14 + w + 3, y);
    }
  }

  // Table des transactions
  if (data.transactions.length > 0) {
    autoTable(doc, {
      // @ts-expect-error lastAutoTable
      startY: (doc.lastAutoTable?.finalY ?? 120) + 14,
      head: [["Date", "Titre", "Type", "Catégorie", "Montant"]],
      body: data.transactions
        .slice(0, 40)
        .map((t) => [
          t.date,
          t.title,
          t.type === "income" ? "Revenu" : "Dépense",
          t.category,
          money(t.amount),
        ]),
      theme: "grid",
      headStyles: { fillColor: [100, 116, 139] },
      styles: { fontSize: 8 },
    });
  }

  doc.save(`${fileBase(data)}.pdf`);
}

/** Export unifié selon le format. */
export async function exportReport(
  data: ReportData,
  format: "CSV" | "XLSX" | "PDF",
): Promise<void> {
  if (format === "CSV") return exportCsv(data);
  if (format === "XLSX") return exportXlsx(data);
  return exportPdf(data);
}
