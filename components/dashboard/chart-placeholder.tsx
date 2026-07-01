import { LineChart } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartPlaceholderProps {
  /** Titre de la future visualisation. */
  title: string;
  /** Courte description du contenu à venir. */
  description?: string;
  /** Hauteur de la zone réservée (classe Tailwind). */
  heightClassName?: string;
}

/**
 * Zone réservée à un futur graphique (Recharts).
 *
 * Sprint 1 : aucun graphique n'est branché. Ce composant matérialise
 * l'emplacement et la taille des visualisations qui arriveront ensuite.
 */
export function ChartPlaceholder({
  title,
  description,
  heightClassName = "h-72",
}: ChartPlaceholderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div
          className={`flex ${heightClassName} border-border bg-muted/40 text-muted-foreground flex-col items-center justify-center gap-2 rounded-lg border border-dashed`}
        >
          <LineChart className="h-8 w-8" />
          <p className="text-sm font-medium">Graphique à venir</p>
          <p className="text-xs">Sera alimenté par Recharts dans un prochain sprint.</p>
        </div>
      </CardContent>
    </Card>
  );
}
