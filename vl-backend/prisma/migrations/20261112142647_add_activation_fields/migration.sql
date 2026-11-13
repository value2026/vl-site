-- Migration: add_activation_fields
-- Adds account activation token fields and isActivated flag to users table.
-- Existing users are set to isActivated = true (they were already using the system).

-- AlterTable
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "activationToken"       TEXT,
  ADD COLUMN IF NOT EXISTS "activationTokenExpiry" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "isActivated"           BOOLEAN NOT NULL DEFAULT true;

-- Backfill: all existing users are considered already activated
UPDATE "users" SET "isActivated" = true WHERE "isActivated" IS NULL;
