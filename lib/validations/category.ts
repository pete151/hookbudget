import { z } from "zod";

/**
 * Schéma de validation d'une catégorie (partagé formulaire ↔ Server Actions).
 */

/** Couleur hexadécimale (#RGB ou #RRGGBB). */
export const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères." })
    .max(40, { message: "Le nom ne peut pas dépasser 40 caractères." }),
  description: z
    .string()
    .trim()
    .max(150, { message: "La description ne peut pas dépasser 150 caractères." })
    .optional()
    .or(z.literal("")),
  icon: z.string().trim().min(1, { message: "Choisissez une icône." }),
  color: z.string().regex(HEX_COLOR_REGEX, { message: "Couleur hexadécimale invalide." }),
  type: z.enum(["income", "expense"], { message: "Type invalide." }),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

/** Valeurs par défaut d'un nouveau formulaire de catégorie. */
export const CATEGORY_FORM_DEFAULTS: CategoryFormValues = {
  name: "",
  description: "",
  icon: "tag",
  color: "#22c55e",
  type: "expense",
};
