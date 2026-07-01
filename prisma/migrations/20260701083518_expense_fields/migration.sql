-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'TRANSFER', 'MOBILE_MONEY', 'CHEQUE', 'OTHER');

-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- AlterTable
ALTER TABLE "expense" ADD COLUMN     "attachmentUrl" TEXT,
ADD COLUMN     "frequency" "RecurrenceFrequency",
ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH';

-- CreateIndex
CREATE INDEX "expense_paymentMethod_idx" ON "expense"("paymentMethod");
