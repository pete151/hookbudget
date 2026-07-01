import type { Currency, Language, Theme } from "@prisma/client";

/** Devises disponibles. */
export const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: "XOF", label: "Franc CFA (XOF)", symbol: "FCFA" },
  { value: "EUR", label: "Euro (EUR)", symbol: "€" },
  { value: "USD", label: "Dollar US (USD)", symbol: "$" },
  { value: "GBP", label: "Livre sterling (GBP)", symbol: "£" },
  { value: "CAD", label: "Dollar canadien (CAD)", symbol: "C$" },
];

/** Locale ISO 4217 → code de devise pour `Intl.NumberFormat`. */
export const CURRENCY_LABELS: Record<Currency, string> = {
  XOF: "Franc CFA (XOF)",
  EUR: "Euro (EUR)",
  USD: "Dollar US (USD)",
  GBP: "Livre sterling (GBP)",
  CAD: "Dollar canadien (CAD)",
};

/** Langues (système i18n extensible). */
export const LANGUAGES: { value: Language; label: string }[] = [
  { value: "FR", label: "Français" },
  { value: "EN", label: "English" },
];

/** Thèmes d'apparence. */
export const THEMES: { value: Theme; label: string }[] = [
  { value: "LIGHT", label: "Clair" },
  { value: "DARK", label: "Sombre" },
  { value: "SYSTEM", label: "Système" },
];

/** Premier jour de la semaine. */
export const FIRST_DAY_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: "Lundi" },
  { value: 0, label: "Dimanche" },
];

/** Formats de date proposés. */
export const DATE_FORMATS: { value: string; label: string }[] = [
  { value: "dd/MM/yyyy", label: "31/12/2026" },
  { value: "MM/dd/yyyy", label: "12/31/2026" },
  { value: "yyyy-MM-dd", label: "2026-12-31" },
];

/** Formats de nombres (locale). */
export const NUMBER_FORMATS: { value: string; label: string }[] = [
  { value: "fr-FR", label: "1 234,56" },
  { value: "en-US", label: "1,234.56" },
  { value: "de-DE", label: "1.234,56" },
];

/** Séparateurs décimaux. */
export const DECIMAL_SEPARATORS: { value: string; label: string }[] = [
  { value: ",", label: "Virgule (,)" },
  { value: ".", label: "Point (.)" },
];
