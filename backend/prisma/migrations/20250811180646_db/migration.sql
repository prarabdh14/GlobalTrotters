-- CreateTable
CREATE TABLE "public"."ai_itineraries" (
    "id" SERIAL NOT NULL,
    "cache_key" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "preferences" JSONB,
    "budget" TEXT,
    "model" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response_json" JSONB,
    "response_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_itineraries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_itineraries_cache_key_key" ON "public"."ai_itineraries"("cache_key");

-- CreateIndex
CREATE INDEX "ix_ai_itin_basic" ON "public"."ai_itineraries"("source", "destination", "start_date", "end_date");
