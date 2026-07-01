/*
  Warnings:

  - You are about to drop the column `completed` on the `saving_goal` table. All the data in the column will be lost.
  - You are about to drop the column `deadline` on the `saving_goal` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SavingPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "SavingStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED');

-- AlterTable
ALTER TABLE "saving_goal" DROP COLUMN "completed",
DROP COLUMN "deadline",
ADD COLUMN     "autoCalculate" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "priority" "SavingPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "status" "SavingStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "targetDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "saving_contribution" (
    "id" TEXT NOT NULL,
    "savingGoalId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "contributionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saving_contribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saving_contribution_savingGoalId_idx" ON "saving_contribution"("savingGoalId");

-- CreateIndex
CREATE INDEX "saving_contribution_contributionDate_idx" ON "saving_contribution"("contributionDate");

-- CreateIndex
CREATE INDEX "saving_goal_status_idx" ON "saving_goal"("status");

-- CreateIndex
CREATE INDEX "saving_goal_priority_idx" ON "saving_goal"("priority");

-- AddForeignKey
ALTER TABLE "saving_contribution" ADD CONSTRAINT "saving_contribution_savingGoalId_fkey" FOREIGN KEY ("savingGoalId") REFERENCES "saving_goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
