/**
 * En-tête de contenu du Dashboard : salutation + date du jour.
 * Server Component (aucune interactivité) — la date est calculée au rendu.
 */
export function DashboardHeader({ name }: { name: string }) {
  const today = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold tracking-tight">Bonjour, {name} 👋</h1>
      <p className="text-muted-foreground text-sm">
        Voici l&apos;état de vos finances — <span className="capitalize">{today}</span>.
      </p>
    </div>
  );
}
