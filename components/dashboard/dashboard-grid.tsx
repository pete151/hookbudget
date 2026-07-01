import { cn } from "@/lib/utils/cn";

/**
 * Grille responsive réutilisable pour le Dashboard.
 * Par défaut : 1 colonne (mobile) → 2 (tablette) → 4 (desktop), adaptée aux
 * cartes statistiques. La densité est ajustable via `columns`.
 */
export function DashboardGrid({
  children,
  columns = 4,
  className,
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2",
        columns === 3 && "lg:grid-cols-3",
        columns === 4 && "lg:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
