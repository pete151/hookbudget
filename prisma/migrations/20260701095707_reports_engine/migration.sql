-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('SUMMARY', 'INCOME', 'EXPENSE', 'CATEGORY', 'BUDGET', 'SAVING', 'CASHFLOW');

-- CreateEnum
CREATE TYPE "ReportFormat" AS ENUM ('CSV', 'XLSX', 'PDF');

-- CreateTable
CREATE TABLE "report" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "format" "ReportFormat" NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "filters" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "report_userId_idx" ON "report"("userId");

-- CreateIndex
CREATE INDEX "report_createdAt_idx" ON "report"("createdAt");

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
