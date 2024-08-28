-- CreateTable
CREATE TABLE "function_subscriptions" (
    "id" UUID NOT NULL,
    "functionId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "function_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "function_subscriptions_functionId_userId_key" ON "function_subscriptions"("functionId", "userId");

-- AddForeignKey
ALTER TABLE "function_subscriptions" ADD CONSTRAINT "function_subscriptions_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "functions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "function_subscriptions" ADD CONSTRAINT "function_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
