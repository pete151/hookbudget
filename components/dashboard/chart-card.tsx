import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** Conteneur standard d'un graphique du Dashboard (titre + zone de rendu). */
export function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/** Style du tooltip Recharts, aligné sur les tokens de thème (dark mode inclus). */
export const chartTooltipStyle = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "var(--popover-foreground)",
    fontSize: "12px",
  },
  labelStyle: { color: "var(--muted-foreground)", marginBottom: 4 },
  itemStyle: { color: "var(--popover-foreground)" },
} as const;
