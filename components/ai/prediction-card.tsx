import { TrendingUp, TrendingDown, Minus } from "lucide-react";

import type { Prediction } from "@/domain/ai/types";
import { PREDICTION_LABELS } from "@/lib/config/ai-config";
import { formatCurrency } from "@/lib/utils/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CONFIDENCE_LABELS: Record<Prediction["confidence"], string> = {
  low: "confiance faible",
  medium: "confiance moyenne",
  high: "confiance élevée",
};

/** Carte de prévision (mois à venir) : valeur estimée + variation + confiance. */
export function PredictionCard({
  prediction,
  currency,
}: {
  prediction: Prediction;
  currency: string;
}) {
  const up = prediction.delta > 0;
  const down = prediction.delta < 0;
  const Arrow = up ? TrendingUp : down ? TrendingDown : Minus;
  const arrowColor = up ? "text-emerald-600" : down ? "text-red-600" : "text-muted-foreground";

  return (
    <Card>
      <CardContent className="space-y-2 pt-6">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">
            {PREDICTION_LABELS[prediction.kind]}
          </span>
          <Badge variant="secondary" className="text-[10px]">
            {CONFIDENCE_LABELS[prediction.confidence]}
          </Badge>
        </div>
        <p className="text-xl font-bold">{formatCurrency(prediction.predictedValue, currency)}</p>
        <div className={`flex items-center gap-1 text-xs font-medium ${arrowColor}`}>
          <Arrow className="h-3.5 w-3.5" />
          {prediction.delta >= 0 ? "+" : ""}
          {formatCurrency(prediction.delta, currency)} ({prediction.deltaPercent >= 0 ? "+" : ""}
          {prediction.deltaPercent} %)
        </div>
        <p className="text-muted-foreground text-xs">{prediction.note}</p>
      </CardContent>
    </Card>
  );
}
