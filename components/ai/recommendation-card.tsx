import { Lightbulb } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

/**
 * Carte de recommandation : met en avant un conseil rédigé (texte libre),
 * par exemple un conseil généré par l'assistant à partir des données.
 */
export function RecommendationCard({ title, text }: { title?: string; text: string }) {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex gap-3 pt-6">
        <span className="bg-primary/15 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
          <Lightbulb className="h-4.5 w-4.5" />
        </span>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">{title ?? "Recommandation"}</h3>
          <p className="text-muted-foreground text-sm whitespace-pre-line">{text}</p>
        </div>
      </CardContent>
    </Card>
  );
}
