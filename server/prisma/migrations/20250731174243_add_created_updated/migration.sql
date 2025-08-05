/*
  Warnings:

  - Added the required column `updatedAt` to the `BoardMeta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CardMeta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `List` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ListMeta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserMeta` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."BoardMeta" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Card" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."CardMeta" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."List" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."ListMeta" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."UserMeta" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
