/*
  Warnings:

  - Added the required column `responses` to the `function_meta` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "HttpVerb" AS ENUM ('GET', 'POST', 'PUT', 'PATCH', 'DELETE');

-- DropIndex
DROP INDEX "functions_ownerUserId_key";

-- AlterTable
ALTER TABLE "function_meta" ADD COLUMN     "responses" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "functions" ADD COLUMN     "description" VARCHAR(1024) NOT NULL DEFAULT '',
ADD COLUMN     "httpVerb" "HttpVerb" NOT NULL DEFAULT 'GET',
ADD COLUMN     "originalFunctionId" UUID;

-- CreateTable
CREATE TABLE "function_arguments" (
    "id" TEXT NOT NULL,
    "functionId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "defaultValue" TEXT,
    "description" VARCHAR(1024) DEFAULT '',
    "isRequired" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "function_arguments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "function_arguments" ADD CONSTRAINT "function_arguments_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "functions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
