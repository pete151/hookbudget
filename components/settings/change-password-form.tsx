"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PasswordInput } from "@/components/auth/password-input";
import { FieldError } from "@/components/auth/form-parts";
import { changePasswordSchema, type ChangePasswordValues } from "@/lib/validations/settings";
import { changePasswordAction } from "@/actions/settings";

/** Formulaire de changement de mot de passe. */
export function ChangePasswordForm() {
  const [isPending, startTransition] = React.useTransition();
  const [revoke, setRevoke] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  function onSubmit(values: ChangePasswordValues) {
    startTransition(async () => {
      const res = await changePasswordAction({ ...values, revokeOtherSessions: revoke });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Mot de passe modifié");
      reset();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cp-current">Mot de passe actuel</Label>
        <PasswordInput
          id="cp-current"
          autoComplete="current-password"
          disabled={isPending}
          {...register("currentPassword")}
        />
        <FieldError message={errors.currentPassword?.message} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cp-new">Nouveau mot de passe</Label>
          <PasswordInput
            id="cp-new"
            autoComplete="new-password"
            disabled={isPending}
            {...register("newPassword")}
          />
          <FieldError message={errors.newPassword?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cp-confirm">Confirmer</Label>
          <PasswordInput
            id="cp-confirm"
            autoComplete="new-password"
            disabled={isPending}
            {...register("confirmPassword")}
          />
          <FieldError message={errors.confirmPassword?.message} />
        </div>
      </div>

      <div className="border-border flex items-center justify-between rounded-md border p-3">
        <div>
          <Label htmlFor="cp-revoke">Déconnecter les autres appareils</Label>
          <p className="text-muted-foreground text-xs">
            Recommandé après un changement de mot de passe.
          </p>
        </div>
        <Switch
          id="cp-revoke"
          checked={revoke}
          onCheckedChange={setRevoke}
          disabled={isPending}
          aria-label="Déconnecter les autres appareils"
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Changer le mot de passe
        </Button>
      </div>
    </form>
  );
}
