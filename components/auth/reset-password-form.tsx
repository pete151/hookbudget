"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { FieldError } from "@/components/auth/form-parts";
import { resetPassword } from "@/lib/auth/auth-client";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/auth/schemas";

/**
 * Formulaire de définition d'un nouveau mot de passe.
 * Le jeton provient du lien reçu par e-mail (`?token=...`).
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  });

  // Jeton manquant ou invalide (lien expiré).
  if (!token || errorParam) {
    return (
      <p className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
        Ce lien de réinitialisation est invalide ou a expiré. Veuillez en demander un nouveau.
      </p>
    );
  }

  async function onSubmit(values: ResetPasswordValues) {
    setFormError(null);
    const { error } = await resetPassword({
      newPassword: values.password,
      token: token!,
    });

    if (error) {
      setFormError(error.message ?? "Impossible de réinitialiser le mot de passe.");
      return;
    }

    toast.success("Mot de passe mis à jour", { description: "Vous pouvez vous connecter." });
    router.push("/login");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="password">Nouveau mot de passe</Label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          placeholder="Au moins 8 caractères"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        <FieldError message={errors.password?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          placeholder="••••••••"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register("confirmPassword")}
        />
        <FieldError message={errors.confirmPassword?.message} />
      </div>

      {formError && (
        <p className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
          {formError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting || !isValid}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSubmitting ? "Mise à jour…" : "Réinitialiser le mot de passe"}
      </Button>
    </form>
  );
}
