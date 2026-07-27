/*
  Warnings:

  - You are about to drop the column `inviteeId` on the `scheduled_calls` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `scheduled_calls` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'Role' AND e.enumlabel = 'content_admin') THEN
    ALTER TYPE "Role" ADD VALUE 'content_admin';
  END IF;
END $$;

-- DropForeignKey
ALTER TABLE "scheduled_calls" DROP CONSTRAINT "scheduled_calls_inviteeId_fkey";

-- AlterTable
ALTER TABLE "experiments" ADD COLUMN     "coverPic" TEXT;

-- AlterTable
ALTER TABLE "labs" ADD COLUMN     "coverPic" TEXT;

-- AlterTable
ALTER TABLE "scheduled_calls" DROP COLUMN "inviteeId",
DROP COLUMN "status";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "batch" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "course" TEXT,
ADD COLUMN     "dept" TEXT,
ADD COLUMN     "designation" TEXT,
ADD COLUMN     "employeeId" TEXT,
ADD COLUMN     "facultyDept" TEXT,
ADD COLUMN     "facultyInst" TEXT,
ADD COLUMN     "mobile" TEXT,
ADD COLUMN     "org" TEXT,
ADD COLUMN     "profilePic" TEXT,
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "section" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "studentId" TEXT,
ADD COLUMN     "username" TEXT,
ADD COLUMN     "yearSemester" TEXT;

-- CreateTable
CREATE TABLE "scheduled_call_invitees" (
    "id" TEXT NOT NULL,
    "scheduledCallId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scheduled_call_invitees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_sections" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "content" JSONB NOT NULL DEFAULT '{}',
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scheduled_call_invitees_scheduledCallId_userId_key" ON "scheduled_call_invitees"("scheduledCallId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "page_sections_pageId_sectionKey_key" ON "page_sections"("pageId", "sectionKey");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "scheduled_call_invitees" ADD CONSTRAINT "scheduled_call_invitees_scheduledCallId_fkey" FOREIGN KEY ("scheduledCallId") REFERENCES "scheduled_calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_call_invitees" ADD CONSTRAINT "scheduled_call_invitees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
