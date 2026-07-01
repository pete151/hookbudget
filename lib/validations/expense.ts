import { z } from "zod";

/**
 * Schéma de validation d'une dépense.
 * Même structure que le revenu, enrichie du mode de paiement, des notes et de
 * la récurrence.
 */
export const expenseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, { message: "Le titre doit contenir au moins 2 caractères." })
    .max(100, { message: "Le titre ne peut pas dépasser 100 caractères." }),
  amount: z
    .number({ message: "Montant invalide." })
    .positive({ message: "Le montant doit être supérieur à zéro." }),
  date: z.string().min(1, { message: "La date est obligatoire." }),
  categoryId: z.string().min(1, { message: "Choisissez une catégorie." }),
  paymentMethod: z.enum(["CASH", "CARD", "TRANSFER", "MOBILE_MONEY", "CHEQUE", "OTHER"], {
    message: "Choisissez un mode de paiement.",
  }),
  description: z
    .string()
    .trim()
    .max(300, { message: "La description ne peut pas dépasser 300 caractères." })
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(500, { message: "Les notes ne peuvent pas dépasser 500 caractères." })
    .optional()
    .or(z.literal("")),
  attachmentUrl: z.string().trim().optional().or(z.literal("")),
  isRecurring: z.boolean(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;

/** Valeurs par défaut d'une nouvelle dépense (date du jour). */
export function expenseFormDefaults(): ExpenseFormValues {
  const today = new Date();
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate(),
  ).padStart(2, "0")}`;
  return {
    title: "",
    amount: 0,
    date: iso,
    categoryId: "",
    paymentMethod: "CASH",
    description: "",
    notes: "",
    attachmentUrl: "",
    isRecurring: false,
    frequency: "MONTHLY",
  };
}
