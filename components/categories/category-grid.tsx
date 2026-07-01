import { CategoryCard } from "@/components/categories/category-card";
import type { CategoryView } from "@/services/categories/categories.service";

/** Grille responsive de cartes de catégories. */
export function CategoryGrid({
  categories,
  onEdit,
  onArchiveToggle,
  onDelete,
}: {
  categories: CategoryView[];
  onEdit: (category: CategoryView) => void;
  onArchiveToggle: (category: CategoryView) => void;
  onDelete: (category: CategoryView) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          onEdit={onEdit}
          onArchiveToggle={onArchiveToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
