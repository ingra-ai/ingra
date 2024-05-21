-- CreateTable
CREATE TABLE "function_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "functionId" UUID NOT NULL,

    CONSTRAINT "function_tags_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "function_tags" ADD CONSTRAINT "function_tags_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "functions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
