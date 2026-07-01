"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { signIn } from "@/lib/auth/auth-client";
import { loginSchema, type LoginValues } from "@/lib/auth/schemas";

/** Formulaire de connexion par e-mail / mot de passe. */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    const { error } = await signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: callbackUrl,
    });

    if (error) {
      setFormError(error.message ?? "Identifiants invalides. Veuillez réessayer.");
      return;
    }

    toast.success("Connexion réussie", { description: "Redirection vers votre tableau de bord…" });
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <SocialLoginButtons disabled={isSubmitting} />
      <AuthDivider />

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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <Link
              href="/forgot-password"
              className="text-primary text-xs font-medium hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          <FieldError message={errors.password?.message} />
        </div>

        {formError && (
          <p className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
            {formError}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting || !isValid}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Connexion…" : "Se connecter"}
        </Button>
      </form>
    </div>
  );
}
