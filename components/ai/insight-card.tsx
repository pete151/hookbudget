import { createElement } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { InsightCard as InsightCardData } from "@/domain/ai/types";
import { INSIGHT_ICONS, INSIGHT_LABELS, SEVERITY_COLOR } from "@/lib/config/ai-config";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Carte d'insight (analyse automatique). Présentation d'une opportunité, d'une
 * alerte, d'un conseil, d'une prévision ou d'une réussite, avec action liée.
 */
export function InsightCard({ insight }: { insight: InsightCardData }) {
  const icon = INSIGHT_ICONS[insight.type];
  const color = SEVERITY_COLOR[insight.severity];

  return (
    <Card>
      <CardContent className="flex gap-3 pt-6">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${color}1a`, color }}
        >
          {createElement(icon, { className: "h-4.5 w-4.5" })}
        </span>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">{insight.title}</h3>
            <Badge variant="outline" className="text-[10px]">
              {INSIGHT_LABELS[insight.type]}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">{insight.message}</p>
          {insight.actionUrl && insight.actionLabel && (
            <Link
              href={insight.actionUrl}
              className="text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline"
            >
              {insight.actionLabel}
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
