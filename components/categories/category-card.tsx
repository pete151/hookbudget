"use client";

import { MoreVertical, Pencil, Archive, ArchiveRestore, Trash2, Lock } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryIcon } from "@/components/categories/category-icon";
import { cn } from "@/lib/utils/cn";
import type { CategoryView } from "@/services/categories/categories.service";

interface CategoryCardProps {
  category: CategoryView;
  onEdit: (category: CategoryView) => void;
  onArchiveToggle: (category: CategoryView) => void;
  onDelete: (category: CategoryView) => void;
}

/** Carte d'une catégorie (système ou personnelle). */
export function CategoryCard({ category, onEdit, onArchiveToggle, onDelete }: CategoryCardProps) {
  return (
    <Card className={cn("relative", category.isArchived && "opacity-60")}>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <CategoryIcon name={category.icon} color={category.color} />

          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{category.name}</p>
            {category.description ? (
              <p className="text-muted-foreground line-clamp-2 text-xs">{category.description}</p>
            ) : (
              <p className="text-muted-foreground/60 text-xs">Aucune description</p>
            )}
          </div>

          {/* Menu d'actions — uniquement pour les catégories personnelles */}
          {category.isSystem ? (
            <span
              className="text-muted-foreground/60"
              title="Catégorie système (lecture seule)"
              aria-label="Catégorie système, non modifiable"
            >
              <Lock className="h-4 w-4" />
            </span>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="-mt-1 -mr-2 h-8 w-8"
                  aria-label="Actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onEdit(category)}>
                  <Pencil className="h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onArchiveToggle(category)}>
                  {category.isArchived ? (
                    <>
                      <ArchiveRestore className="h-4 w-4" />
                      Restaurer
                    </>
                  ) : (
                    <>
                      <Archive className="h-4 w-4" />
                      Archiver
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => onDelete(category)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={category.type === "income" ? "default" : "secondary"}>
            {category.type === "income" ? "Revenu" : "Dépense"}
          </Badge>
          {category.isSystem && <Badge variant="outline">Système</Badge>}
          {category.isArchived && <Badge variant="outline">Archivée</Badge>}
          <span className="text-muted-foreground ml-auto text-xs">
            {category.usageCount} utilisation{category.usageCount > 1 ? "s" : ""}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
