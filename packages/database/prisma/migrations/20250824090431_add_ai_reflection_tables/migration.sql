-- CreateEnum
CREATE TYPE "public"."ReflectionAuthor" AS ENUM ('USER', 'AI');

-- CreateTable
CREATE TABLE "public"."ai_analyses" (
    "id" TEXT NOT NULL,
    "entry_id" TEXT NOT NULL,
    "moodPrimary" TEXT NOT NULL,
    "moodSecondary" TEXT,
    "moodScore" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "themes" JSONB NOT NULL,
    "insights" JSONB NOT NULL,
    "patterns" JSONB NOT NULL,
    "suggestions" JSONB NOT NULL,
    "raw" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reflection_messages" (
    "id" TEXT NOT NULL,
    "entry_id" TEXT NOT NULL,
    "author" "public"."ReflectionAuthor" NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reflection_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_analyses_entry_id_key" ON "public"."ai_analyses"("entry_id");

-- CreateIndex
CREATE INDEX "ai_analyses_entry_id_idx" ON "public"."ai_analyses"("entry_id");

-- CreateIndex
CREATE INDEX "reflection_messages_entry_id_created_at_idx" ON "public"."reflection_messages"("entry_id", "created_at");

-- AddForeignKey
ALTER TABLE "public"."ai_analyses" ADD CONSTRAINT "ai_analyses_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reflection_messages" ADD CONSTRAINT "reflection_messages_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
