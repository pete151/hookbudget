import { fr, type Dictionary } from "@/lib/i18n/dictionaries/fr";
import { en } from "@/lib/i18n/dictionaries/en";
import type { Locale } from "@/lib/i18n/config";

const DICTIONARIES: Record<Locale, Dictionary> = { fr, en };

/** Retourne le dictionnaire d'une locale (fallback français). */
export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? fr;
}

export type { Dictionary };
