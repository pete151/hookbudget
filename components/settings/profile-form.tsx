"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/auth/form-parts";
import { AvatarUploader } from "@/components/settings/avatar-uploader";
import { profileSchema, type ProfileValues } from "@/lib/validations/settings";
import { updateProfileAction } from "@/actions/settings";
import type { SettingsView } from "@/services/settings/settings.service";

/** Formulaire de profil. */
export function ProfileForm({ profile }: { profile: SettingsView["profile"] }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      phone: profile.phone ?? "",
      profession: profile.profession ?? "",
      company: profile.company ?? "",
      bio: profile.bio ?? "",
      country: profile.country ?? "",
      city: profile.city ?? "",
      image: profile.image ?? "",
    },
  });

  function onSubmit(values: ProfileValues) {
    startTransition(async () => {
      const res = await updateProfileAction(values);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Profil mis à jour");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        control={control}
        name="image"
        render={({ field }) => (
          <AvatarUploader
            value={field.value ?? ""}
            onChange={field.onChange}
            name={profile.name}
            disabled={isPending}
          />
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="p-firstName">Prénom</Label>
          <Input id="p-firstName" disabled={isPending} {...register("firstName")} />
          <FieldError message={errors.firstName?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-lastName">Nom</Label>
          <Input id="p-lastName" disabled={isPending} {...register("lastName")} />
          <FieldError message={errors.lastName?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-phone">Téléphone</Label>
          <Input id="p-phone" type="tel" disabled={isPending} {...register("phone")} />
          <FieldError message={errors.phone?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-profession">Profession</Label>
          <Input id="p-profession" disabled={isPending} {...register("profession")} />
          <FieldError message={errors.profession?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-company">Entreprise</Label>
          <Input id="p-company" disabled={isPending} {...register("company")} />
          <FieldError message={errors.company?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-country">Pays</Label>
          <Input id="p-country" disabled={isPending} {...register("country")} />
          <FieldError message={errors.country?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-city">Ville</Label>
          <Input id="p-city" disabled={isPending} {...register("city")} />
          <FieldError message={errors.city?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="p-bio">Bio</Label>
        <Textarea id="p-bio" rows={3} disabled={isPending} {...register("bio")} />
        <FieldError message={errors.bio?.message} />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
