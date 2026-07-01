/*
  Warnings:

  - You are about to drop the column `month` on the `budget` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `budget` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `budget` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `budget` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BudgetType" AS ENUM ('GLOBAL', 'CATEGORY', 'PROJECT');

-- AlterEnum
ALTER TYPE "BudgetPeriod" ADD VALUE 'CUSTOM';

-- DropIndex
DROP INDEX "budget_month_idx";

-- DropIndex
DROP INDEX "budget_userId_categoryId_month_year_key";

-- DropIndex
DROP INDEX "budget_year_idx";

-- AlterTable
ALTER TABLE "budget" DROP COLUMN "month",
DROP COLUMN "year",
ADD COLUMN     "alert100" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "alert50" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "alert80" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "budgetType" "BudgetType" NOT NULL DEFAULT 'GLOBAL',
ADD COLUMN     "description" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "remainingAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "spentAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "budget_budgetType_idx" ON "budget"("budgetType");

-- CreateIndex
CREATE INDEX "budget_isActive_idx" ON "budget"("isActive");

-- CreateIndex
CREATE INDEX "budget_startDate_idx" ON "budget"("startDate");

-- CreateIndex
CREATE INDEX "budget_endDate_idx" ON "budget"("endDate");
