/*
  Warnings:

  - You are about to alter the column `code` on the `phrase_codes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "phrase_codes" ALTER COLUMN "code" SET DATA TYPE VARCHAR(255);
