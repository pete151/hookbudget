import { z } from "zod";

import { HEX_COLOR_REGEX } from "@/lib/validations/category";

/**
 * Schémas de validation des objectifs d'épargne et des contributions.
 */

/**
 * Autoriser une date cible dans le passé ? (option configurable — règle métier).
 * Passez à `false` pour refuser les dates cibles antérieures à aujourd'hui.
 */
export const ALLOW_PAST_TARGET_DATE = true;

export const savingGoalSchema = z
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
    targetAmount: z
      .number({ message: "Montant invalide." })
      .positive({ message: "Le montant cible doit être supérieur à zéro." }),
    targetDate: z.string().optional().or(z.literal("")),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"], { message: "Priorité invalide." }),
    color: z.string().regex(HEX_COLOR_REGEX, { message: "Couleur hexadécimale invalide." }),
    icon: z.string().trim().min(1, { message: "Choisissez une icône." }),
  })
  .refine(
    (data) =>
      ALLOW_PAST_TARGET_DATE ||
      !data.targetDate ||
      new Date(data.targetDate) >= new Date(new Date().toDateString()),
    { message: "La date cible ne peut pas être dans le passé.", path: ["targetDate"] },
  );

export type SavingGoalFormValues = z.infer<typeof savingGoalSchema>;

export const contributionSchema = z.object({
  amount: z
    .number({ message: "Montant invalide." })
    .positive({ message: "La contribution doit être supérieure à zéro." }),
  contributionDate: z.string().min(1, { message: "La date est obligatoire." }),
  note: z
    .string()
    .trim()
    .max(300, { message: "La note ne peut pas dépasser 300 caractères." })
    .optional()
    .or(z.literal("")),
});

export type ContributionFormValues = z.infer<typeof contributionSchema>;

/** Chaîne `YYYY-MM-DD` du jour. */
function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Valeurs par défaut d'un nouvel objectif. */
export function savingGoalFormDefaults(): SavingGoalFormValues {
  return {
    name: "",
    description: "",
    targetAmount: 0,
    targetDate: "",
    priority: "MEDIUM",
    color: "#22c55e",
    icon: "target",
  };
}

/** Valeurs par défaut d'une nouvelle contribution. */
export function contributionFormDefaults(): ContributionFormValues {
  return { amount: 0, contributionDate: todayIso(), note: "" };
}
