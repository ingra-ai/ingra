-- AlterTable
ALTER TABLE "_FunctionCollections" ADD CONSTRAINT "_FunctionCollections_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_FunctionCollections_AB_unique";

-- AlterTable
ALTER TABLE "oauth_tokens" ADD COLUMN     "code" VARCHAR(255),
ADD COLUMN     "state" VARCHAR(255);
