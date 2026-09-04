-- AlterTable
ALTER TABLE "listing_promotions" ADD COLUMN "gender" TEXT;

UPDATE "listing_promotions"
SET "gender" = CASE
  WHEN array_length("genders", 1) = 2 THEN 'BOTH'
  WHEN 'MALE' = ANY("genders") THEN 'MALE'
  ELSE 'FEMALE'
END;

ALTER TABLE "listing_promotions" ALTER COLUMN "gender" SET NOT NULL;
ALTER TABLE "listing_promotions" ALTER COLUMN "gender" SET DEFAULT 'BOTH';
ALTER TABLE "listing_promotions" DROP COLUMN "genders";
