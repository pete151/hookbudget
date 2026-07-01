"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { AuthDivider, FieldError } from "@/components/auth/form-parts";
import { signUp } from "@/lib/auth/auth-client";
import { registerSchema, type RegisterValues } from "@/lib/auth/schemas";

/** Formulaire d'inscription (création de compte). */
export function RegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: RegisterValues) {
    setFormError(null);
    const { error } = await signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      callbackURL: "/dashboard",
    });

    if (error) {
      setFormError(error.message ?? "Impossible de créer le compte. Veuillez réessayer.");
      return;
    }

    toast.success("Compte créé", { description: "Bienvenue sur HookBudget !" });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <SocialLoginButtons disabled={isSubmitting} />
      <AuthDivider label="Ou inscrivez-vous par e-mail" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="name">Nom complet</Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Awa Koné"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
          <FieldError message={errors.name?.message} />
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
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
          {isSubmitting ? "Création…" : "Créer mon compte"}
        </Button>
      </form>
    </div>
  );
}
