/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `auth_provider` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `google_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `profile_image` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[googleid]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `firstname` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullname` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastname` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."EntryKind" AS ENUM ('WRITE', 'TALK', 'DRAW');

-- CreateEnum
CREATE TYPE "public"."MediaKind" AS ENUM ('AUDIO', 'IMAGE', 'VIDEO');

-- DropIndex
DROP INDEX "public"."users_google_id_key";

-- AlterTable
ALTER TABLE "public"."users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "auth_provider",
DROP COLUMN "created_at",
DROP COLUMN "first_name",
DROP COLUMN "google_id",
DROP COLUMN "is_active",
DROP COLUMN "last_name",
DROP COLUMN "profile_image",
DROP COLUMN "updated_at",
ADD COLUMN     "authprovider" TEXT DEFAULT 'local',
ADD COLUMN     "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "firstname" TEXT NOT NULL,
ADD COLUMN     "fullname" TEXT NOT NULL,
ADD COLUMN     "googleid" TEXT,
ADD COLUMN     "isactive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "journalingsince" TIMESTAMP(3),
ADD COLUMN     "lastname" TEXT NOT NULL,
ADD COLUMN     "profileimage" TEXT,
ADD COLUMN     "updatedat" TIMESTAMP(3),
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "users_id_seq";

-- CreateTable
CREATE TABLE "public"."journals" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "ownerid" TEXT NOT NULL,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."entries" (
    "id" TEXT NOT NULL,
    "journal_id" TEXT NOT NULL,
    "kind" "public"."EntryKind" NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "rating" SMALLINT,
    "mood_label" TEXT,
    "snippet" VARCHAR(255),
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "entrydate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wordcount" INTEGER DEFAULT 0,
    "is_draft" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."media" (
    "id" TEXT NOT NULL,
    "entry_id" TEXT NOT NULL,
    "kind" "public"."MediaKind" NOT NULL,
    "url" TEXT NOT NULL,
    "thumburl" TEXT,
    "durationseconds" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "filename" TEXT,
    "filesize" INTEGER,
    "mime_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT DEFAULT '#6B7280',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mood_points" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "score" SMALLINT NOT NULL,
    "color" TEXT,
    "emotion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mood_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."streaks" (
    "id" TEXT NOT NULL,
    "userid" TEXT NOT NULL,
    "currentstreak" INTEGER NOT NULL DEFAULT 0,
    "longeststreak" INTEGER NOT NULL DEFAULT 0,
    "lastentrydate" TIMESTAMP(3),
    "totalentries" INTEGER NOT NULL DEFAULT 0,
    "monthlygoal" INTEGER NOT NULL DEFAULT 10,
    "monthlycount" INTEGER NOT NULL DEFAULT 0,
    "current_month" TEXT,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "streaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reminderenabled" BOOLEAN NOT NULL DEFAULT false,
    "remindertime" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "defaultentrykind" "public"."EntryKind" NOT NULL DEFAULT 'WRITE',
    "auto_save" BOOLEAN NOT NULL DEFAULT true,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_EntryTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EntryTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "journals_ownerid_idx" ON "public"."journals"("ownerid");

-- CreateIndex
CREATE INDEX "entries_journal_id_deleted_at_entrydate_idx" ON "public"."entries"("journal_id", "deleted_at", "entrydate" DESC);

-- CreateIndex
CREATE INDEX "media_entry_id_idx" ON "public"."media"("entry_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "public"."tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "mood_points_user_id_day_key" ON "public"."mood_points"("user_id", "day");

-- CreateIndex
CREATE UNIQUE INDEX "streaks_userid_key" ON "public"."streaks"("userid");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "public"."user_preferences"("user_id");

-- CreateIndex
CREATE INDEX "_EntryTags_B_index" ON "public"."_EntryTags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleid_key" ON "public"."users"("googleid");

-- AddForeignKey
ALTER TABLE "public"."journals" ADD CONSTRAINT "journals_ownerid_fkey" FOREIGN KEY ("ownerid") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."entries" ADD CONSTRAINT "entries_journal_id_fkey" FOREIGN KEY ("journal_id") REFERENCES "public"."journals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."media" ADD CONSTRAINT "media_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mood_points" ADD CONSTRAINT "mood_points_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."streaks" ADD CONSTRAINT "streaks_userid_fkey" FOREIGN KEY ("userid") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EntryTags" ADD CONSTRAINT "_EntryTags_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EntryTags" ADD CONSTRAINT "_EntryTags_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
