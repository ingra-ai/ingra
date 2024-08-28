/*
  Warnings:

  - You are about to alter the column `name` on the `function_tags` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.

*/
-- AlterTable
ALTER TABLE "function_tags" ALTER COLUMN "name" SET DATA TYPE VARCHAR(64);
