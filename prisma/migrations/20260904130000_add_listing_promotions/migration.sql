-- CreateEnum
CREATE TYPE "PromotionStatus" AS ENUM ('PENDING_REVIEW', 'PROCESSING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "listing_promotions" (
    "id" TEXT NOT NULL,
    "status" "PromotionStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "audienceType" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "minAge" INTEGER NOT NULL,
    "maxAge" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "dailyBudget" DOUBLE PRECISION NOT NULL,
    "totalBudget" DOUBLE PRECISION NOT NULL,
    "placements" TEXT[],
    "primaryText" TEXT NOT NULL,
    "callToAction" TEXT NOT NULL DEFAULT 'SEND_MESSAGE',
    "estimatedMinReach" INTEGER NOT NULL,
    "estimatedMaxReach" INTEGER NOT NULL,
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "listingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reviewedById" TEXT,

    CONSTRAINT "listing_promotions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "listing_promotions_listingId_idx" ON "listing_promotions"("listingId");

-- CreateIndex
CREATE INDEX "listing_promotions_userId_idx" ON "listing_promotions"("userId");

-- CreateIndex
CREATE INDEX "listing_promotions_status_idx" ON "listing_promotions"("status");

-- CreateIndex
CREATE INDEX "listing_promotions_submittedAt_idx" ON "listing_promotions"("submittedAt");

-- AddForeignKey
ALTER TABLE "listing_promotions" ADD CONSTRAINT "listing_promotions_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_promotions" ADD CONSTRAINT "listing_promotions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_promotions" ADD CONSTRAINT "listing_promotions_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
