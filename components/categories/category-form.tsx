"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldError } from "@/components/auth/form-parts";
import { CategoryIcon } from "@/components/categories/category-icon";
import { CategoryIconPicker } from "@/components/categories/category-icon-picker";
import { CategoryColorPicker } from "@/components/categories/category-color-picker";
import { categorySchema, type CategoryFormValues } from "@/lib/validations/category";

/** Formulaire de création/édition d'une catégorie, avec aperçu en direct. */
export function CategoryForm({
  defaultValues,
  onSubmit,
  pending,
  submitLabel,
}: {
  defaultValues: CategoryFormValues;
  onSubmit: (values: CategoryFormValues) => void;
  pending: boolean;
  submitLabel: string;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    mode: "onChange",
    defaultValues,
  });

  // Aperçu en direct : `useWatch` est memoizable (contrairement à `watch()`).
  const preview = useWatch({ control, defaultValue: defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Aperçu en direct */}
      <div className="border-border bg-muted/30 flex items-center gap-3 rounded-lg border p-3">
        <CategoryIcon name={preview.icon} color={preview.color} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{preview.name || "Nom de la catégorie"}</p>
          <Badge variant="secondary" className="mt-0.5 text-[10px] font-normal">
            {preview.type === "income" ? "Revenu" : "Dépense"}
          </Badge>
        </div>
      </div>

      {/* Nom */}
      <div className="space-y-2">
        <Label htmlFor="category-name">Nom</Label>
        <Input
          id="category-name"
          placeholder="Ex. Abonnements"
          disabled={pending}
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        <FieldError message={errors.name?.message} />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="category-description">Description (facultatif)</Label>
        <Textarea
          id="category-description"
          rows={2}
          placeholder="À quoi sert cette catégorie ?"
          disabled={pending}
          aria-invalid={Boolean(errors.description)}
          {...register("description")}
        />
        <FieldError message={errors.description?.message} />
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label htmlFor="category-type">Type</Label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={pending}>
              <SelectTrigger id="category-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Dépense</SelectItem>
                <SelectItem value="income">Revenu</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Icône */}
      <div className="space-y-2">
        <Label>Icône</Label>
        <Controller
          control={control}
          name="icon"
          render={({ field }) => (
            <CategoryIconPicker
              value={field.value}
              onChange={field.onChange}
              color={preview.color}
            />
          )}
        />
        <FieldError message={errors.icon?.message} />
      </div>

      {/* Couleur */}
      <div className="space-y-2">
        <Label>Couleur</Label>
        <Controller
          control={control}
          name="color"
          render={({ field }) => (
            <CategoryColorPicker value={field.value} onChange={field.onChange} />
          )}
        />
        <FieldError message={errors.color?.message} />
      </div>

      <Button type="submit" className="w-full" disabled={pending || !isValid}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}
