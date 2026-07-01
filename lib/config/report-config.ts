import type { ReportKind, ExportFormat } from "@/domain/reports/types";

/** Types de rapports proposés dans l'assistant. */
export const REPORT_TYPES: {
  value: ReportKind;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: "SUMMARY",
    label: "Résumé financier",
    description: "Revenus, dépenses, solde, épargne.",
    icon: "layout-dashboard",
  },
  {
    value: "INCOME",
    label: "Rapport des revenus",
    description: "Détail et répartition des revenus.",
    icon: "trending-up",
  },
  {
    value: "EXPENSE",
    label: "Rapport des dépenses",
    description: "Détail et répartition des dépenses.",
    icon: "wallet",
  },
  {
    value: "CATEGORY",
    label: "Rapport par catégorie",
    description: "Revenus et dépenses par catégorie.",
    icon: "tags",
  },
  {
    value: "BUDGET",
    label: "Rapport des budgets",
    description: "Consommation des budgets.",
    icon: "piggy-bank",
  },
  {
    value: "SAVING",
    label: "Objectifs d'épargne",
    description: "Progression des objectifs.",
    icon: "target",
  },
  {
    value: "CASHFLOW",
    label: "Flux de trésorerie",
    description: "Entrées, sorties et net par mois.",
    icon: "line-chart",
  },
];

export const REPORT_TYPE_LABELS: Record<ReportKind, string> = {
  SUMMARY: "Résumé financier",
  INCOME: "Rapport des revenus",
  EXPENSE: "Rapport des dépenses",
  CATEGORY: "Rapport par catégorie",
  BUDGET: "Rapport des budgets",
  SAVING: "Objectifs d'épargne",
  CASHFLOW: "Flux de trésorerie",
};

export const EXPORT_FORMATS: { value: ExportFormat; label: string; description: string }[] = [
  { value: "CSV", label: "CSV", description: "Fichier texte séparé par des points-virgules." },
  { value: "XLSX", label: "Excel (.xlsx)", description: "Classeur multi-feuilles." },
  { value: "PDF", label: "PDF", description: "Document imprimable avec résumé et tableaux." },
];

/** Préréglages de période. */
export const PERIOD_PRESETS: { value: string; label: string }[] = [
  { value: "this-month", label: "Ce mois-ci" },
  { value: "last-month", label: "Mois dernier" },
  { value: "this-year", label: "Cette année" },
  { value: "last-year", label: "Année dernière" },
  { value: "last-12m", label: "12 derniers mois" },
  { value: "custom", label: "Personnalisé" },
];

/** Calcule les bornes ISO (YYYY-MM-DD) d'un préréglage de période. */
export function periodPresetBounds(preset: string): { from: string; to: string } {
  const now = new Date();
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  switch (preset) {
    case "last-month": {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: iso(from), to: iso(to) };
    }
    case "this-year":
      return { from: iso(new Date(now.getFullYear(), 0, 1)), to: iso(now) };
    case "last-year":
      return {
        from: iso(new Date(now.getFullYear() - 1, 0, 1)),
        to: iso(new Date(now.getFullYear() - 1, 11, 31)),
      };
    case "last-12m":
      return { from: iso(new Date(now.getFullYear(), now.getMonth() - 11, 1)), to: iso(now) };
    case "this-month":
    default:
      return { from: iso(new Date(now.getFullYear(), now.getMonth(), 1)), to: iso(now) };
  }
}
