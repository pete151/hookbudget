import { z } from "zod";

/**
 * Schéma de validation d'un revenu (partagé formulaire ↔ Server Actions).
 * Pensé pour être dupliqué/adapté au module Dépenses (Sprint 7).
 */
export const incomeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, { message: "Le titre doit contenir au moins 2 caractères." })
    .max(100, { message: "Le titre ne peut pas dépasser 100 caractères." }),
  amount: z
    .number({ message: "Montant invalide." })
    .positive({ message: "Le montant doit être supérieur à zéro." }),
  date: z.string().min(1, { message: "La date est obligatoire." }),
  description: z
    .string()
    .trim()
    .max(300, { message: "La description ne peut pas dépasser 300 caractères." })
    .optional()
    .or(z.literal("")),
  source: z
    .string()
    .trim()
    .max(100, { message: "La source ne peut pas dépasser 100 caractères." })
    .optional()
    .or(z.literal("")),
  categoryId: z.string().min(1, { message: "Choisissez une catégorie." }),
});

export type IncomeFormValues = z.infer<typeof incomeSchema>;

/** Valeurs par défaut d'un nouveau revenu (date du jour au format YYYY-MM-DD). */
export function incomeFormDefaults(): IncomeFormValues {
  const today = new Date();
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate(),
  ).padStart(2, "0")}`;
  return { title: "", amount: 0, date: iso, description: "", source: "", categoryId: "" };
}
