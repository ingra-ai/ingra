/*
  Warnings:

  - You are about to drop the column `timeZone` on the `OAuthToken` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OAuthToken" DROP COLUMN "timeZone";

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "timeZone" VARCHAR(128) NOT NULL DEFAULT 'UTC';
