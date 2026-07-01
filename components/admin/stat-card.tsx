import { createElement } from "react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

/** Carte d'indicateur (Back Office). */
export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">{label}</p>
          {icon && (
            <span className="text-muted-foreground">
              {createElement(icon, { className: "h-4 w-4" })}
            </span>
          )}
        </div>
        <p className="mt-2 text-2xl font-bold">{value}</p>
        {hint && <p className="text-muted-foreground mt-1 text-xs">{hint}</p>}
      </CardContent>
    </Card>
  );
}
