/*
  Warnings:

  - You are about to drop the `function_forks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "function_forks" DROP CONSTRAINT "function_forks_forkedFunctionId_fkey";

-- DropForeignKey
ALTER TABLE "function_forks" DROP CONSTRAINT "function_forks_originalFunctionId_fkey";

-- DropTable
DROP TABLE "function_forks";

-- CreateTable
CREATE TABLE "collections" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT DEFAULT '',
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_subscriptions" (
    "id" UUID NOT NULL,
    "collectionId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CollectionToFunction" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "collections_name_userId_key" ON "collections"("name", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "collection_subscriptions_collectionId_userId_key" ON "collection_subscriptions"("collectionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "_CollectionToFunction_AB_unique" ON "_CollectionToFunction"("A", "B");

-- CreateIndex
CREATE INDEX "_CollectionToFunction_B_index" ON "_CollectionToFunction"("B");

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_subscriptions" ADD CONSTRAINT "collection_subscriptions_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_subscriptions" ADD CONSTRAINT "collection_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToFunction" ADD CONSTRAINT "_CollectionToFunction_A_fkey" FOREIGN KEY ("A") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToFunction" ADD CONSTRAINT "_CollectionToFunction_B_fkey" FOREIGN KEY ("B") REFERENCES "functions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
