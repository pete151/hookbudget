import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Instance Prisma partagée (pattern singleton).
 *
 * En développement, Next.js recharge les modules à chaque modification ;
 * sans ce cache global on créerait une nouvelle connexion à chaque rechargement.
 *
 * Prisma 7 nécessite un « driver adapter » pour la connexion runtime :
 * ici l'adapter PostgreSQL (`@prisma/adapter-pg`) lit `DATABASE_URL`.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
