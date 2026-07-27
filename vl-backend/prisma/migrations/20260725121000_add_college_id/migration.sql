-- AlterTable
ALTER TABLE "institutions" ADD COLUMN "collegeId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "institutions_collegeId_key" ON "institutions"("collegeId");
