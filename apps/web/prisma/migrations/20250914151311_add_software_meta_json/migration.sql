-- AlterTable
ALTER TABLE "Software" ADD COLUMN     "meta" JSONB;

-- CreateIndex
CREATE INDEX "Software_updatedAt_idx" ON "Software"("updatedAt");
