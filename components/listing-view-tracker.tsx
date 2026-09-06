"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";
import { attributionStorageKey, type StoredAttribution } from "@/components/attribution-tracker";

interface ListingViewTrackerProps {
  listingId: string;
  visitId: string;
}

function value(searchParams: { get(name: string): string | null }, key: string) {
  return searchParams.get(key)?.trim() || null;
}

export function ListingViewTracker({ listingId, visitId }: ListingViewTrackerProps) {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    let stored: StoredAttribution | null = null;
    try {
      stored = JSON.parse(sessionStorage.getItem(attributionStorageKey) ?? "null") as StoredAttribution | null;
    } catch {
      stored = null;
    }
    const attributedValue = (key: string, storedValue: string | null | undefined) => value(searchParams, key) ?? storedValue ?? null;
    void api("listings/[id]/views", {
      method: "POST",
      params: { id: listingId },
      body: {
        visitId,
        landingUrl: window.location.href,
        referrer: (stored?.referrer ?? document.referrer) || null,
        utmSource: attributedValue("utm_source", stored?.utmSource),
        utmMedium: attributedValue("utm_medium", stored?.utmMedium),
        utmCampaign: attributedValue("utm_campaign", stored?.utmCampaign),
        utmTerm: attributedValue("utm_term", stored?.utmTerm),
        utmContent: attributedValue("utm_content", stored?.utmContent),
        gclid: attributedValue("gclid", stored?.gclid),
        fbclid: attributedValue("fbclid", stored?.fbclid),
      },
    }).catch(() => undefined);
  }, [listingId, visitId]);

  return null;
}
