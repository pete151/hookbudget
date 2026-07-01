/*
  Warnings:

  - The `language` column on the `settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `currency` column on the `settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('XOF', 'EUR', 'USD', 'GBP', 'CAD');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('FR', 'EN');

-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dateFormat" TEXT NOT NULL DEFAULT 'dd/MM/yyyy',
ADD COLUMN     "decimalSeparator" TEXT NOT NULL DEFAULT ',',
ADD COLUMN     "defaultNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "firstDayOfWeek" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "numberFormat" TEXT NOT NULL DEFAULT 'fr-FR',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "language",
ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'FR',
DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'XOF';

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profession" TEXT;
