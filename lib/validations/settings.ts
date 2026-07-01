import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

/** Profil utilisateur. */
export const profileSchema = z.object({
  firstName: optionalText(50),
  lastName: optionalText(50),
  phone: optionalText(30),
  profession: optionalText(80),
  company: optionalText(80),
  bio: optionalText(300),
  country: optionalText(60),
  city: optionalText(60),
  image: z.string().trim().url({ message: "URL invalide." }).optional().or(z.literal("")),
});
export type ProfileValues = z.infer<typeof profileSchema>;

/** Préférences de format. */
export const preferencesSchema = z.object({
  firstDayOfWeek: z.number().int().min(0).max(1),
  dateFormat: z.string().min(1),
  numberFormat: z.string().min(1),
  decimalSeparator: z.enum([",", "."]),
  defaultNotifications: z.boolean(),
});
export type PreferencesValues = z.infer<typeof preferencesSchema>;

/** Apparence. */
export const appearanceSchema = z.object({
  theme: z.enum(["LIGHT", "DARK", "SYSTEM"]),
});
export type AppearanceValues = z.infer<typeof appearanceSchema>;

/** Devise. */
export const currencySchema = z.object({
  currency: z.enum(["XOF", "EUR", "USD", "GBP", "CAD"]),
});
export type CurrencyValues = z.infer<typeof currencySchema>;

/** Langue. */
export const languageSchema = z.object({
  language: z.enum(["FR", "EN"]),
});
export type LanguageValues = z.infer<typeof languageSchema>;

/** Changement de mot de passe. */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Mot de passe actuel requis." }),
    newPassword: z
      .string()
      .min(8, { message: "Le nouveau mot de passe doit contenir au moins 8 caractères." }),
    confirmPassword: z.string(),
    revokeOtherSessions: z.boolean().optional(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

/** Ligne d'import de transaction. */
export const importRowSchema = z.object({
  date: z.string().min(1),
  type: z.enum(["income", "expense"]),
  title: z.string().trim().min(1).max(100),
  amount: z.number().positive(),
  category: z.string().trim().optional(),
});
export type ImportRow = z.infer<typeof importRowSchema>;
