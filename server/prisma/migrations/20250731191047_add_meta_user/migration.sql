/*
  Warnings:

  - A unique constraint covering the columns `[userId,key]` on the table `UserMeta` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserMeta_userId_key_key" ON "public"."UserMeta"("userId", "key");
