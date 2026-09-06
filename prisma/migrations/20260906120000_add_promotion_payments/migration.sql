CREATE TYPE "PromotionPaymentStatus" AS ENUM ('PENDING', 'SUBMITTED', 'APPROVED');

CREATE TABLE "promotion_payments" (
    "id" TEXT NOT NULL,
    "status" "PromotionPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT NOT NULL DEFAULT 'BKASH',
    "recipientNumber" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "transactionId" TEXT,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "promotionId" TEXT NOT NULL,

    CONSTRAINT "promotion_payments_pkey" PRIMARY KEY ("id")
);

INSERT INTO "promotion_payments" (
    "id",
    "status",
    "recipientNumber",
    "amount",
    "approvedAt",
    "createdAt",
    "updatedAt",
    "promotionId"
)
SELECT
    CONCAT('payment_', MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT || "id")),
    CASE WHEN "status" = 'APPROVED' THEN 'APPROVED'::"PromotionPaymentStatus" ELSE 'PENDING'::"PromotionPaymentStatus" END,
    '01534792218',
    "totalBudget",
    CASE WHEN "status" = 'APPROVED' THEN "reviewedAt" ELSE NULL END,
    "submittedAt",
    "updatedAt",
    "id"
FROM "listing_promotions";

CREATE UNIQUE INDEX "promotion_payments_transactionId_key" ON "promotion_payments"("transactionId");
CREATE UNIQUE INDEX "promotion_payments_promotionId_key" ON "promotion_payments"("promotionId");
CREATE INDEX "promotion_payments_status_idx" ON "promotion_payments"("status");
CREATE INDEX "promotion_payments_createdAt_idx" ON "promotion_payments"("createdAt");

ALTER TABLE "promotion_payments" ADD CONSTRAINT "promotion_payments_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "listing_promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
