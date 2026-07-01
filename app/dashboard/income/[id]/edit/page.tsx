import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireAuth } from "@/lib/auth/server";
import { getIncomeById } from "@/services/income/income.service";
import { getIncomeCategories } from "@/services/categories/categories.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditIncomeForm } from "@/components/income/edit-income-form";

export const metadata: Metadata = {
  title: "Modifier le revenu",
};

/** Page d'édition d'un revenu. */
export default async function EditIncomePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;

  const [income, categories] = await Promise.all([
    getIncomeById(user.id, id),
    getIncomeCategories(user.id),
  ]);

  if (!income) notFound();

  const formCategories = categories.map((c) => ({ id: c.id, name: c.name, color: c.color }));

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href={`/dashboard/income/${income.id}`}>
          <ArrowLeft className="h-4 w-4" />
          Retour au revenu
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Modifier le revenu</CardTitle>
        </CardHeader>
        <CardContent>
          <EditIncomeForm income={income} categories={formCategories} />
        </CardContent>
      </Card>
    </div>
  );
}
