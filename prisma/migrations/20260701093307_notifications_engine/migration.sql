/*
  Warnings:

  - You are about to drop the column `read` on the `notification` table. All the data in the column will be lost.
  - The `type` column on the `notification` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'BUDGET', 'SAVING', 'INCOME', 'EXPENSE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- DropIndex
DROP INDEX "notification_read_idx";

-- AlterTable
ALTER TABLE "notification" DROP COLUMN "read",
ADD COLUMN     "actionUrl" TEXT,
ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "readAt" TIMESTAMP(3),
DROP COLUMN "type",
ADD COLUMN     "type" "NotificationType" NOT NULL DEFAULT 'INFO';

-- CreateTable
CREATE TABLE "notification_preference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "budgetAlerts" BOOLEAN NOT NULL DEFAULT true,
    "savingAlerts" BOOLEAN NOT NULL DEFAULT true,
    "incomeAlerts" BOOLEAN NOT NULL DEFAULT true,
    "expenseAlerts" BOOLEAN NOT NULL DEFAULT true,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT false,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT false,
    "weeklySummary" BOOLEAN NOT NULL DEFAULT false,
    "monthlySummary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_preference_userId_key" ON "notification_preference"("userId");

-- CreateIndex
CREATE INDEX "notification_isRead_idx" ON "notification"("isRead");

-- CreateIndex
CREATE INDEX "notification_type_idx" ON "notification"("type");

-- AddForeignKey
ALTER TABLE "notification_preference" ADD CONSTRAINT "notification_preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
