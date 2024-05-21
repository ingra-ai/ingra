/*
  Warnings:

  - The `originalFunctionId` column on the `functions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('LIKE', 'DISLIKE');

-- AlterTable
ALTER TABLE "functions" DROP COLUMN "originalFunctionId",
ADD COLUMN     "originalFunctionId" UUID;

-- CreateTable
CREATE TABLE "function_forks" (
    "id" UUID NOT NULL,
    "originalFunctionId" UUID NOT NULL,
    "forkedFunctionId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "function_forks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "function_reactions" (
    "id" UUID NOT NULL,
    "functionId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "ReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "function_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "function_forks_originalFunctionId_forkedFunctionId_key" ON "function_forks"("originalFunctionId", "forkedFunctionId");

-- CreateIndex
CREATE UNIQUE INDEX "function_reactions_functionId_userId_type_key" ON "function_reactions"("functionId", "userId", "type");

-- AddForeignKey
ALTER TABLE "function_forks" ADD CONSTRAINT "function_forks_originalFunctionId_fkey" FOREIGN KEY ("originalFunctionId") REFERENCES "functions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "function_forks" ADD CONSTRAINT "function_forks_forkedFunctionId_fkey" FOREIGN KEY ("forkedFunctionId") REFERENCES "functions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "function_reactions" ADD CONSTRAINT "function_reactions_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "functions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "function_reactions" ADD CONSTRAINT "function_reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
