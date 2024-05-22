/*
  Warnings:

  - You are about to drop the column `lastRefreshedAt` on the `oauth_tokens` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "oauth_tokens" DROP COLUMN "lastRefreshedAt";
