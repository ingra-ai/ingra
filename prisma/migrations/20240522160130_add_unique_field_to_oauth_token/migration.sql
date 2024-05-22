/*
  Warnings:

  - A unique constraint covering the columns `[userId,refreshToken]` on the table `oauth_tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "oauth_tokens_userId_refreshToken_key" ON "oauth_tokens"("userId", "refreshToken");
