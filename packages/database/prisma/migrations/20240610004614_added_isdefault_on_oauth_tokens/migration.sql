-- AlterTable
ALTER TABLE "oauth_tokens" ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false;
