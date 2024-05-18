/*
  Warnings:

  - You are about to drop the `phrase_codes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "phrase_codes" DROP CONSTRAINT "phrase_codes_userId_fkey";

-- DropTable
DROP TABLE "phrase_codes";
