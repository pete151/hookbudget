import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { CategoryIcon } from "@/components/categories/category-icon";
import type { ReportKind } from "@/domain/reports/types";

/** Carte cliquable d'un type de rapport (accès rapide à l'assistant). */
export function ReportCard({
  type,
  label,
  description,
  icon,
}: {
  type: ReportKind;
  label: string;
  description: string;
  icon: string;
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <Link href={`/dashboard/reports/new?type=${type}`} className="block">
        <CardContent className="flex items-center gap-3 p-4">
          <CategoryIcon name={icon} color="#22c55e" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{label}</p>
            <p className="text-muted-foreground truncate text-xs">{description}</p>
          </div>
          <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
        </CardContent>
      </Link>
    </Card>
  );
}
