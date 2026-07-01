/**
 * Helpers de formatage réutilisables (montants, pourcentages, dates).
 * Aucune logique métier ici : uniquement de la présentation.
 */

/** Devise par défaut de l'application. */
export const DEFAULT_CURRENCY = "XOF";
export const DEFAULT_LOCALE = "fr-FR";

/**
 * Formate un montant en devise.
 * @example formatCurrency(1500) // "1 500 FCFA"
 */
export function formatCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formate une variation en pourcentage avec son signe.
 * @example formatPercent(12.4) // "+12,4 %"
 */
export function formatPercent(value: number, locale: string = DEFAULT_LOCALE): string {
  const formatted = new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 1,
    signDisplay: "always",
  }).format(value / 100);
  return formatted;
}

/** Formate une date courte (ex. "30 juin 2026"). */
export function formatDate(date: Date | string, locale: string = DEFAULT_LOCALE): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
