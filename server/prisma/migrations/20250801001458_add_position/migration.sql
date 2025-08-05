-- AlterTable
ALTER TABLE "public"."Board" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."Card" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."List" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;
