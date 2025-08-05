/*
  Warnings:

  - The primary key for the `Board` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `BoardMeta` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Card` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CardMeta` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `List` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ListMeta` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserMeta` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Board" DROP CONSTRAINT "Board_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BoardMeta" DROP CONSTRAINT "BoardMeta_boardId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Card" DROP CONSTRAINT "Card_listId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CardMeta" DROP CONSTRAINT "CardMeta_cardId_fkey";

-- DropForeignKey
ALTER TABLE "public"."List" DROP CONSTRAINT "List_boardId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ListMeta" DROP CONSTRAINT "ListMeta_listId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserMeta" DROP CONSTRAINT "UserMeta_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Board" DROP CONSTRAINT "Board_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Board_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Board_id_seq";

-- AlterTable
ALTER TABLE "public"."BoardMeta" DROP CONSTRAINT "BoardMeta_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "boardId" SET DATA TYPE TEXT,
ADD CONSTRAINT "BoardMeta_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "BoardMeta_id_seq";

-- AlterTable
ALTER TABLE "public"."Card" DROP CONSTRAINT "Card_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "listId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Card_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Card_id_seq";

-- AlterTable
ALTER TABLE "public"."CardMeta" DROP CONSTRAINT "CardMeta_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "cardId" SET DATA TYPE TEXT,
ADD CONSTRAINT "CardMeta_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CardMeta_id_seq";

-- AlterTable
ALTER TABLE "public"."List" DROP CONSTRAINT "List_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "boardId" SET DATA TYPE TEXT,
ADD CONSTRAINT "List_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "List_id_seq";

-- AlterTable
ALTER TABLE "public"."ListMeta" DROP CONSTRAINT "ListMeta_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "listId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ListMeta_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ListMeta_id_seq";

-- AlterTable
ALTER TABLE "public"."User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "password" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AlterTable
ALTER TABLE "public"."UserMeta" DROP CONSTRAINT "UserMeta_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserMeta_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "UserMeta_id_seq";

-- AddForeignKey
ALTER TABLE "public"."UserMeta" ADD CONSTRAINT "UserMeta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Board" ADD CONSTRAINT "Board_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BoardMeta" ADD CONSTRAINT "BoardMeta_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "public"."Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."List" ADD CONSTRAINT "List_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "public"."Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ListMeta" ADD CONSTRAINT "ListMeta_listId_fkey" FOREIGN KEY ("listId") REFERENCES "public"."List"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Card" ADD CONSTRAINT "Card_listId_fkey" FOREIGN KEY ("listId") REFERENCES "public"."List"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CardMeta" ADD CONSTRAINT "CardMeta_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "public"."Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
