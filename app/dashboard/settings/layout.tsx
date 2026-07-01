import { SettingsNav } from "@/components/settings/settings-nav";

/**
 * Layout du centre de paramètres : sous-navigation + contenu.
 * S'applique à toutes les pages `/dashboard/settings/*`.
 */
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground text-sm">
          Gérez votre profil, votre sécurité et vos préférences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <SettingsNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
