import { z } from "zod";

/**
 * Schémas de validation Zod pour l'authentification.
 * Centralisés ici pour être partagés entre les formulaires (client) et,
 * si besoin, le serveur. Messages d'erreur clairs et en français.
 */

const email = z.email({ message: "Adresse e-mail invalide." });

const password = z
  .string()
  .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères." });

/** Connexion. */
export const loginSchema = z.object({
  email,
  password: z.string().min(1, { message: "Le mot de passe est requis." }),
});
export type LoginValues = z.infer<typeof loginSchema>;

/** Inscription (avec confirmation du mot de passe). */
export const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });
export type RegisterValues = z.infer<typeof registerSchema>;

/** Demande de réinitialisation du mot de passe. */
export const forgotPasswordSchema = z.object({
  email,
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

/** Définition d'un nouveau mot de passe (avec confirmation). */
export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
