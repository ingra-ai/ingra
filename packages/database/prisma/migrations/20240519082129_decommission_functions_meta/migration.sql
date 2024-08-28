/*
  Warnings:

  - You are about to drop the `function_meta` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "function_meta" DROP CONSTRAINT "function_meta_functionId_fkey";

-- DropTable
DROP TABLE "function_meta";
