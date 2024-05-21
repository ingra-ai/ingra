/*
  Warnings:

  - You are about to alter the column `slug` on the `functions` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.

*/
-- DropIndex
DROP INDEX "functions_slug_key";

-- AlterTable
ALTER TABLE "functions" ALTER COLUMN "slug" SET DATA TYPE VARCHAR(64);
