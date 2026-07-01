import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireAuth } from "@/lib/auth/server";
import { getCategories } from "@/services/categories/categories.service";
import { Button } from "@/components/ui/button";
import { ReportBuilder } from "@/components/reports/report-builder";
import type { ReportKind } from "@/domain/reports/types";

export const metadata: Metadata = {
  title: "Nouveau rapport",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const VALID_TYPES: ReportKind[] = [
  "SUMMARY",
  "INCOME",
  "EXPENSE",
  "CATEGORY",
  "BUDGET",
  "SAVING",
  "CASHFLOW",
];

/** Assistant de création de rapport. */
export default async function NewReportPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireAuth();
  const sp = await searchParams;
  const typeParam = Array.isArray(sp.type) ? sp.type[0] : sp.type;
  const defaultType = VALID_TYPES.includes(typeParam as ReportKind)
    ? (typeParam as ReportKind)
    : "SUMMARY";

  const categories = await getCategories(user.id);
  const formCategories = categories.map((c) => ({ id: c.id, name: c.name, color: c.color }));

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/reports">
          <ArrowLeft className="h-4 w-4" />
          Retour aux rapports
        </Link>
      </Button>

      <ReportBuilder
        categories={formCategories}
        currency={user.currency ?? "XOF"}
        defaultType={defaultType}
      />
    </div>
  );
}
