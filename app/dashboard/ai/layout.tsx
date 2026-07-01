import type { ReactNode } from "react";

import { AiNav } from "@/components/ai/ai-nav";

/** Mise en page de la section Assistant IA (en-tête + onglets). */
export default function AiLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assistant financier IA</h1>
        <p className="text-muted-foreground text-sm">
          Des conseils personnalisés, fondés uniquement sur vos données réelles.
        </p>
      </div>
      <AiNav />
      {children}
    </div>
  );
}
