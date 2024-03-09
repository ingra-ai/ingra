/*
  Warnings:

  - You are about to drop the column `authCode` on the `MagicLinkToken` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MagicLinkToken" DROP COLUMN "authCode",
ADD COLUMN     "otpCode" VARCHAR(6);
