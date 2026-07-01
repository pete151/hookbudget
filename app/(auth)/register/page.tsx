import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Inscription",
};

/** Page d'inscription. */
export default function RegisterPage() {
  return (
    <AuthCard
      title="Créer un compte"
      description="Commencez à gérer votre budget en quelques minutes."
      footerText="Déjà inscrit ?"
      footerLinkLabel="Se connecter"
      footerLinkHref="/login"
    >
      <RegisterForm />
    </AuthCard>
  );
}
