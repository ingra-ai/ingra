/*
  Warnings:

  - A unique constraint covering the columns `[userId,primaryEmailAddress,service]` on the table `oauth_tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "oauth_tokens_userId_primaryEmailAddress_service_key" ON "oauth_tokens"("userId", "primaryEmailAddress", "service");
