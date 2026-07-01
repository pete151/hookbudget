import { z } from "zod";

/**
 * Schéma de validation d'un budget.
 * Règles métier : montant > 0, date de fin ≥ date de début, catégorie
 * obligatoire lorsque le type est CATEGORY.
 */
export const budgetSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: "Le nom doit contenir au moins 2 caractères." })
      .max(60, { message: "Le nom ne peut pas dépasser 60 caractères." }),
    description: z
      .string()
      .trim()
      .max(300, { message: "La description ne peut pas dépasser 300 caractères." })
      .optional()
      .or(z.literal("")),
    amount: z
      .number({ message: "Montant invalide." })
      .positive({ message: "Le montant doit être supérieur à zéro." }),
    budgetType: z.enum(["GLOBAL", "CATEGORY", "PROJECT"], { message: "Type de budget invalide." }),
    period: z.enum(["MONTHLY", "WEEKLY", "YEARLY", "CUSTOM"], { message: "Période invalide." }),
    startDate: z.string().min(1, { message: "La date de début est obligatoire." }),
    endDate: z.string().min(1, { message: "La date de fin est obligatoire." }),
    categoryId: z.string().optional().or(z.literal("")),
    isActive: z.boolean(),
    alert50: z.boolean(),
    alert80: z.boolean(),
    alert100: z.boolean(),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "La date de fin doit être postérieure à la date de début.",
    path: ["endDate"],
  })
  .refine((data) => data.budgetType !== "CATEGORY" || Boolean(data.categoryId), {
    message: "Choisissez une catégorie pour un budget par catégorie.",
    path: ["categoryId"],
  });

export type BudgetFormValues = z.infer<typeof budgetSchema>;

/** Valeurs par défaut d'un nouveau budget (mois courant). */
export function budgetFormDefaults(): BudgetFormValues {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  return {
    name: "",
    description: "",
    amount: 0,
    budgetType: "GLOBAL",
    period: "MONTHLY",
    startDate: iso(start),
    endDate: iso(end),
    categoryId: "",
    isActive: true,
    alert50: true,
    alert80: true,
    alert100: true,
  };
}
