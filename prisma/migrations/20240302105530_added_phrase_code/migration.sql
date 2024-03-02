-- CreateTable
CREATE TABLE "phrase_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isAuthenticated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phrase_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "phrase_codes_code_key" ON "phrase_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "phrase_codes_userId_key" ON "phrase_codes"("userId");

-- AddForeignKey
ALTER TABLE "phrase_codes" ADD CONSTRAINT "phrase_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
