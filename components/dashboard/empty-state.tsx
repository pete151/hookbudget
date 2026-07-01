import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  /** Icône illustrative. */
  icon: LucideIcon;
  /** Titre court. */
  title: string;
  /** Description optionnelle. */
  description?: string;
  /** Libellé du bouton d'action (ex. « Créer votre premier revenu »). */
  actionLabel?: string;
  /** Destination du bouton d'action (route CRUD à venir). */
  actionHref?: string;
  /** Classe additionnelle (hauteur, etc.). */
  className?: string;
}

/**
 * État vide réutilisable : illustration + message + appel à l'action.
 * Les liens pointent vers les futures routes CRUD (prochains sprints).
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "border-border bg-muted/30 flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-10 text-center",
        className,
      )}
    >
      <span className="bg-accent text-accent-foreground flex h-12 w-12 items-center justify-center rounded-full">
        <Icon className="h-6 w-6" />
      </span>
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>
      {actionLabel && actionHref && (
        <Button asChild size="sm" className="mt-1">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
