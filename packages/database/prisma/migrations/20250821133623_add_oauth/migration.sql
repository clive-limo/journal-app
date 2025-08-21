-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "refresh_token" TEXT,
ADD COLUMN     "refresh_token_expiry" TIMESTAMP(3),
ADD COLUMN     "refresh_token_hash" TEXT;
