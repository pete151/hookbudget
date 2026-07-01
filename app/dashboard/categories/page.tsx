import type { Metadata } from "next";

import { requireAuth } from "@/lib/auth/server";
import { getCategories } from "@/services/categories/categories.service";
import { CategoriesClient } from "@/components/categories/categories-client";

export const metadata: Metadata = {
  title: "Catégories",
};

/**
 * Page Catégories (Server Component).
 * Récupère les catégories visibles (système + personnelles) de l'utilisateur
 * connecté, puis délègue l'interactivité au composant client.
 */
export default async function CategoriesPage() {
  const user = await requireAuth();
  const categories = await getCategories(user.id);

  return <CategoriesClient categories={categories} />;
}
