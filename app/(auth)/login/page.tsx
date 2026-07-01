import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Connexion",
};

/** Page de connexion. */
export default function LoginPage() {
  return (
    <AuthCard
      title="Connexion"
      description="Accédez à votre tableau de bord HookBudget."
      footerText="Pas encore de compte ?"
      footerLinkLabel="Créer un compte"
      footerLinkHref="/register"
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
