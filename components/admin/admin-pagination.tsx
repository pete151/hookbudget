"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { buttonVariants } from "@/components/ui/button";

/** Pagination pilotée par l'URL (param `page`), pour les tableaux du Back Office. */
export function AdminPagination({ page, totalPages }: { page: number; totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function href(target: number): string {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(target));
    return `${pathname}?${params.toString()}`;
  }

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-muted-foreground text-sm">
        Page {page} sur {totalPages}
      </p>
      <div className="flex gap-2">
        <Link
          href={href(page - 1)}
          aria-disabled={prevDisabled}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            prevDisabled && "pointer-events-none opacity-50",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          Précédent
        </Link>
        <Link
          href={href(page + 1)}
          aria-disabled={nextDisabled}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            nextDisabled && "pointer-events-none opacity-50",
          )}
        >
          Suivant
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
