"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth/auth-client";

/** Logo Google (SVG inline — lucide ne fournit plus les icônes de marque). */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

/** Logo GitHub (SVG inline). */
function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.42c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.4-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.05.78 2.13v3.16c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

/**
 * Boutons de connexion sociale (Google & GitHub).
 *
 * Préparés pour l'avenir : l'UI est complète, mais un fournisseur ne fonctionne
 * réellement que si ses clés OAuth sont configurées côté serveur (voir
 * `lib/auth/auth.ts`). En leur absence, un message d'erreur clair s'affiche.
 */
export function SocialLoginButtons({ disabled }: { disabled?: boolean }) {
  const [loading, setLoading] = React.useState<"google" | "github" | null>(null);

  async function handleSocial(provider: "google" | "github") {
    setLoading(provider);
    try {
      await signIn.social({ provider, callbackURL: "/dashboard" });
    } catch {
      toast.error("Connexion sociale indisponible", {
        description: "Ce fournisseur n'est pas encore configuré.",
      });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={disabled || loading !== null}
        onClick={() => handleSocial("google")}
      >
        <GoogleIcon />
        {loading === "google" ? "Redirection…" : "Continuer avec Google"}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={disabled || loading !== null}
        onClick={() => handleSocial("github")}
      >
        <GithubIcon />
        {loading === "github" ? "Redirection…" : "Continuer avec GitHub"}
      </Button>
    </div>
  );
}
