import type { SavingStatus } from "@prisma/client";

import { cn } from "@/lib/utils/cn";
import { savingProgressColor } from "@/lib/config/saving-config";

/**
 * Barre de progression d'un objectif d'épargne, à couleur dynamique
 * (rouge → orange → vert selon l'avancement). Bornée à 100 %.
 */
export function SavingProgress({
  percent,
  status,
  className,
}: {
  percent: number;
  status: SavingStatus;
  className?: string;
}) {
  const width = Math.min(100, Math.max(0, percent));
  const color = savingProgressColor(percent, status);

  return (
    <div
      className={cn("bg-muted h-2 w-full overflow-hidden rounded-full", className)}
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progression de l'objectif"
    >
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${width}%`, backgroundColor: color }}
      />
    </div>
  );
}
