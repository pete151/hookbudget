"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/auth/form-parts";
import { requestPasswordReset } from "@/lib/auth/auth-client";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/auth/schemas";

/** Formulaire de demande de réinitialisation du mot de passe. */
export function ForgotPasswordForm() {
  const [formError, setFormError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setFormError(null);
    const { error } = await requestPasswordReset({
      email: values.email,
      redirectTo: "/reset-password",
    });

    if (error) {
      setFormError(error.message ?? "Une erreur est survenue. Veuillez réessayer.");
      return;
    }

    // Message volontairement neutre (ne révèle pas si l'e-mail existe).
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <span className="bg-accent text-accent-foreground flex h-12 w-12 items-center justify-center rounded-full">
          <MailCheck className="h-6 w-6" />
        </span>
        <p className="text-muted-foreground text-sm">
          Si un compte est associé à cette adresse, un lien de réinitialisation vient d&apos;être
          envoyé. Pensez à vérifier vos spams.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Adresse e-mail</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="vous@exemple.com"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>

      {formError && (
        <p className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
          {formError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting || !isValid}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSubmitting ? "Envoi…" : "Envoyer le lien de réinitialisation"}
      </Button>
    </form>
  );
}
