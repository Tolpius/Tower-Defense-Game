-- AlterTable
ALTER TABLE "User" ADD COLUMN "nickname" TEXT;

-- Backfill existing users with deterministic guest names
WITH numbered AS (
    SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt", "id") AS rn
    FROM "User"
)
UPDATE "User" AS u
SET "nickname" = 'Guest' || numbered.rn::TEXT
FROM numbered
WHERE u."id" = numbered."id";

-- Enforce constraints
ALTER TABLE "User" ALTER COLUMN "nickname" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_nickname_key" ON "User"("nickname");
