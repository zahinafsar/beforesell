/*
  Warnings:

  - You are about to drop the column `condition` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `districtId` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the `districts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `divisions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `locationId` to the `listings` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttributeType" AS ENUM ('SELECT', 'MULTI_SELECT', 'TEXT', 'NUMBER', 'BOOLEAN');

-- DropForeignKey
ALTER TABLE "districts" DROP CONSTRAINT "districts_divisionId_fkey";

-- DropForeignKey
ALTER TABLE "listings" DROP CONSTRAINT "listings_districtId_fkey";

-- DropIndex
DROP INDEX "listings_districtId_idx";

-- AlterTable
ALTER TABLE "listings" DROP COLUMN "condition",
DROP COLUMN "districtId",
ADD COLUMN     "locationId" TEXT NOT NULL;

-- DropTable
DROP TABLE "districts";

-- DropTable
DROP TABLE "divisions";

-- DropEnum
DROP TYPE "Condition";

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_attributes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "AttributeType" NOT NULL,
    "options" TEXT[],
    "unit" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "filterable" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_attribute_values" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "attributeId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_attribute_values_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "locations_address_key" ON "locations"("address");

-- CreateIndex
CREATE INDEX "category_attributes_categoryId_idx" ON "category_attributes"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "category_attributes_categoryId_slug_key" ON "category_attributes"("categoryId", "slug");

-- CreateIndex
CREATE INDEX "listing_attribute_values_listingId_idx" ON "listing_attribute_values"("listingId");

-- CreateIndex
CREATE INDEX "listing_attribute_values_attributeId_idx" ON "listing_attribute_values"("attributeId");

-- CreateIndex
CREATE INDEX "listing_attribute_values_value_idx" ON "listing_attribute_values"("value");

-- CreateIndex
CREATE UNIQUE INDEX "listing_attribute_values_listingId_attributeId_key" ON "listing_attribute_values"("listingId", "attributeId");

-- CreateIndex
CREATE INDEX "listings_locationId_idx" ON "listings"("locationId");

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_attributes" ADD CONSTRAINT "category_attributes_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_attribute_values" ADD CONSTRAINT "listing_attribute_values_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_attribute_values" ADD CONSTRAINT "listing_attribute_values_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "category_attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
