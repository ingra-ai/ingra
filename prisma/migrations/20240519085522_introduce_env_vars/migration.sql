-- CreateTable
CREATE TABLE "env_vars" (
    "id" SERIAL NOT NULL,
    "ownerUserId" UUID NOT NULL,
    "key" VARCHAR(64) NOT NULL,
    "value" VARCHAR(512) NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "env_vars_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "env_vars_key_key" ON "env_vars"("key");

-- CreateIndex
CREATE UNIQUE INDEX "env_vars_ownerUserId_key_key" ON "env_vars"("ownerUserId", "key");

-- AddForeignKey
ALTER TABLE "env_vars" ADD CONSTRAINT "env_vars_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
