import { createElement } from "react";

import { getCategoryIcon } from "@/lib/config/category-icons";
import { cn } from "@/lib/utils/cn";

/**
 * Pastille d'icône de catégorie : résout le nom Lucide et applique la couleur.
 * Composant présentationnel réutilisé par la carte, le formulaire et l'aperçu.
 */
export function CategoryIcon({
  name,
  color,
  className,
  iconClassName,
}: {
  name?: string | null;
  color?: string | null;
  className?: string;
  iconClassName?: string;
}) {
  const icon = getCategoryIcon(name);
  const tint = color ?? "#64748b";

  return (
    <span
      className={cn("flex h-10 w-10 items-center justify-center rounded-lg", className)}
      style={{ backgroundColor: `${tint}1a`, color: tint }}
    >
      {createElement(icon, { className: cn("h-5 w-5", iconClassName) })}
    </span>
  );
}
