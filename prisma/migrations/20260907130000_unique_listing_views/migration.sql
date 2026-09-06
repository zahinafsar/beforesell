DELETE FROM "listing_view_events" AS current
USING "listing_view_events" AS earlier
WHERE current."listingId" = earlier."listingId"
  AND current."viewerKey" = earlier."viewerKey"
  AND (
    current."createdAt" > earlier."createdAt"
    OR (current."createdAt" = earlier."createdAt" AND current."id" > earlier."id")
  );

ALTER TABLE "listing_view_events" RENAME COLUMN "visitorId" TO "deviceId";
CREATE UNIQUE INDEX "listing_view_events_listingId_viewerKey_key" ON "listing_view_events"("listingId", "viewerKey");
ALTER TABLE "listings" DROP COLUMN "views";
