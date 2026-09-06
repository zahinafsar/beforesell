CREATE TABLE "listing_view_events" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "viewerKey" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "referrer" TEXT,
    "landingUrl" TEXT NOT NULL,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "gclid" TEXT,
    "fbclid" TEXT,
    "deviceType" TEXT NOT NULL,
    "browser" TEXT NOT NULL,
    "operatingSystem" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listingId" TEXT NOT NULL,
    "viewerUserId" TEXT,

    CONSTRAINT "listing_view_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "listing_view_events_visitId_key" ON "listing_view_events"("visitId");
CREATE INDEX "listing_view_events_listingId_createdAt_idx" ON "listing_view_events"("listingId", "createdAt");
CREATE INDEX "listing_view_events_listingId_viewerKey_idx" ON "listing_view_events"("listingId", "viewerKey");
CREATE INDEX "listing_view_events_source_idx" ON "listing_view_events"("source");
CREATE INDEX "listing_view_events_utmSource_idx" ON "listing_view_events"("utmSource");

ALTER TABLE "listing_view_events" ADD CONSTRAINT "listing_view_events_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "listing_view_events" ADD CONSTRAINT "listing_view_events_viewerUserId_fkey" FOREIGN KEY ("viewerUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
