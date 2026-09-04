-- AlterTable
ALTER TABLE "listing_promotions"
ADD COLUMN "genders" TEXT[] NOT NULL DEFAULT ARRAY['MALE', 'FEMALE']::TEXT[],
DROP COLUMN "placements",
DROP COLUMN "primaryText",
DROP COLUMN "callToAction";
