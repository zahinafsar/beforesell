/*
  Warnings:

  - Made the column `categoryId` on table `listings` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "listings" DROP CONSTRAINT "listings_categoryId_fkey";

-- AlterTable
ALTER TABLE "listings" ALTER COLUMN "categoryId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
