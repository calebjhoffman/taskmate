-- AlterTable
ALTER TABLE "public"."Card" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "public"."List" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."List" ADD CONSTRAINT "List_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Card" ADD CONSTRAINT "Card_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
