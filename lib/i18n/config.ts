/**
 * Configuration i18n (préparée, extensible).
 *
 * ⚠️ Sprint 12 : l'architecture est en place mais l'interface n'est pas encore
 * traduite intégralement. Pour ajouter une langue : créer un dictionnaire dans
 * `lib/i18n/dictionaries/<locale>.ts`, l'enregistrer dans `getDictionary`, et
 * ajouter l'entrée dans `LOCALES`.
 */

export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";

/** Convertit l'enum Prisma `Language` en locale i18n. */
export function languageToLocale(language: "FR" | "EN"): Locale {
  return language === "EN" ? "en" : "fr";
}
