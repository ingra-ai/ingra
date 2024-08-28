/*
  Warnings:

  - You are about to alter the column `originalFunctionId` on the `functions` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.

*/
-- AlterTable
ALTER TABLE "functions" ALTER COLUMN "originalFunctionId" SET DATA TYPE VARCHAR(64);
