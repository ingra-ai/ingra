/*
  Warnings:

  - You are about to drop the `_CollectionToFunction` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug,userId]` on the table `collections` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_CollectionToFunction" DROP CONSTRAINT "_CollectionToFunction_A_fkey";

-- DropForeignKey
ALTER TABLE "_CollectionToFunction" DROP CONSTRAINT "_CollectionToFunction_B_fkey";

-- DropTable
DROP TABLE "_CollectionToFunction";

-- CreateTable
CREATE TABLE "_FunctionCollections" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FunctionCollections_AB_unique" ON "_FunctionCollections"("A", "B");

-- CreateIndex
CREATE INDEX "_FunctionCollections_B_index" ON "_FunctionCollections"("B");

-- CreateIndex
CREATE UNIQUE INDEX "collections_slug_userId_key" ON "collections"("slug", "userId");

-- AddForeignKey
ALTER TABLE "_FunctionCollections" ADD CONSTRAINT "_FunctionCollections_A_fkey" FOREIGN KEY ("A") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FunctionCollections" ADD CONSTRAINT "_FunctionCollections_B_fkey" FOREIGN KEY ("B") REFERENCES "functions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
