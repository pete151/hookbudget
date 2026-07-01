import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
};

/** Page de demande de réinitialisation du mot de passe. */
export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Mot de passe oublié"
      description="Saisissez votre e-mail pour recevoir un lien de réinitialisation."
      footerText="Vous vous en souvenez ?"
      footerLinkLabel="Se connecter"
      footerLinkHref="/login"
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
