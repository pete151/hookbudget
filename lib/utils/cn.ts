import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Fusionne des classes Tailwind de façon intelligente.
 * `clsx` gère les valeurs conditionnelles, `twMerge` résout les conflits
 * (ex. `px-2 px-4` → `px-4`). Utilisé par tous les composants UI.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
