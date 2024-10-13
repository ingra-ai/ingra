-- CreateTable
CREATE TABLE "function_execution_logs" (
    "id" UUID NOT NULL,
    "functionId" UUID NOT NULL,
    "userId" UUID,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestData" JSONB,
    "responseData" JSONB,
    "executionTime" INTEGER,
    "error" TEXT,

    CONSTRAINT "function_execution_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" UUID NOT NULL,
    "messages" JSONB NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "function_execution_logs_functionId_idx" ON "function_execution_logs"("functionId");

-- CreateIndex
CREATE INDEX "function_execution_logs_userId_idx" ON "function_execution_logs"("userId");

-- CreateIndex
CREATE INDEX "Chat_userId_idx" ON "Chat"("userId");

-- AddForeignKey
ALTER TABLE "function_execution_logs" ADD CONSTRAINT "function_execution_logs_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "functions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "function_execution_logs" ADD CONSTRAINT "function_execution_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
