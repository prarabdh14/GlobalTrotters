/*
  Warnings:

  - Added the required column `user_id` to the `ai_itineraries` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Add the column as nullable first
ALTER TABLE "public"."ai_itineraries" ADD COLUMN "user_id" INTEGER;

-- Step 2: Update existing records (we'll set them to a default user or delete them)
-- For now, we'll delete existing records since they don't have user associations
DELETE FROM "public"."ai_itineraries" WHERE "user_id" IS NULL;

-- Step 3: Make the column required
ALTER TABLE "public"."ai_itineraries" ALTER COLUMN "user_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "ix_ai_itin_user" ON "public"."ai_itineraries"("user_id");

-- AddForeignKey
ALTER TABLE "public"."ai_itineraries" ADD CONSTRAINT "ai_itineraries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
