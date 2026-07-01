/**
 * Seed HookBudget — catégories système par défaut.
 *
 * Insère les catégories de dépenses et de revenus partagées par tous les
 * utilisateurs (`userId = null`, `isDefault = true`).
 *
 * Idempotent : relançable sans créer de doublons (seules les catégories
 * manquantes sont ajoutées).
 *
 * Lancement : `npm run db:seed` (ou automatiquement via `prisma migrate`).
 */
import "dotenv/config";
import { PrismaClient, TransactionType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/** Une catégorie système : nom, icône (Lucide) et couleur. */
type SeedCategory = { name: string; icon: string; color: string };

const EXPENSE_CATEGORIES: SeedCategory[] = [
  { name: "Nourriture", icon: "utensils", color: "#f97316" },
  { name: "Transport", icon: "car", color: "#3b82f6" },
  { name: "Santé", icon: "heart-pulse", color: "#ef4444" },
  { name: "Loyer", icon: "home", color: "#8b5cf6" },
  { name: "Internet", icon: "wifi", color: "#06b6d4" },
  { name: "Électricité", icon: "zap", color: "#eab308" },
  { name: "Loisirs", icon: "gamepad-2", color: "#ec4899" },
  { name: "Shopping", icon: "shopping-bag", color: "#14b8a6" },
  { name: "Éducation", icon: "graduation-cap", color: "#6366f1" },
];

const INCOME_CATEGORIES: SeedCategory[] = [
  { name: "Salaire", icon: "briefcase", color: "#22c55e" },
  { name: "Freelance", icon: "laptop", color: "#10b981" },
  { name: "Commerce", icon: "store", color: "#84cc16" },
  { name: "Prime", icon: "gift", color: "#f59e0b" },
  { name: "Investissement", icon: "trending-up", color: "#0ea5e9" },
  { name: "Cadeau", icon: "gift", color: "#d946ef" },
];

/** Crée les catégories système manquantes pour un type donné. */
async function seedSystemCategories(type: TransactionType, list: SeedCategory[]): Promise<number> {
  const existing = await prisma.category.findMany({
    where: { userId: null, type },
    select: { name: true },
  });
  const existingNames = new Set(existing.map((c) => c.name));
  const toCreate = list.filter((c) => !existingNames.has(c.name));

  if (toCreate.length > 0) {
    await prisma.category.createMany({
      data: toCreate.map((c) => ({
        name: c.name,
        icon: c.icon,
        color: c.color,
        type,
        isDefault: true,
        userId: null,
      })),
    });
  }

  return toCreate.length;
}

async function main() {
  console.info("🌱 Seed HookBudget — catégories système…");

  const createdExpenses = await seedSystemCategories(TransactionType.EXPENSE, EXPENSE_CATEGORIES);
  const createdIncomes = await seedSystemCategories(TransactionType.INCOME, INCOME_CATEGORIES);

  console.info(
    `✅ Terminé : ${createdExpenses} catégorie(s) de dépense et ${createdIncomes} catégorie(s) de revenu ajoutée(s).`,
  );
}

main()
  .catch((error) => {
    console.error("❌ Échec du seed :", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
