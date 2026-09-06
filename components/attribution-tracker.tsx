"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export const attributionStorageKey = "beforesell:attribution";

export interface StoredAttribution {
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  gclid: string | null;
  fbclid: string | null;
}

function value(searchParams: { get(name: string): string | null }, key: string) {
  return searchParams.get(key)?.trim() || null;
}

export function AttributionTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const attribution: StoredAttribution = {
      referrer: document.referrer || null,
      utmSource: value(searchParams, "utm_source"),
      utmMedium: value(searchParams, "utm_medium"),
      utmCampaign: value(searchParams, "utm_campaign"),
      utmTerm: value(searchParams, "utm_term"),
      utmContent: value(searchParams, "utm_content"),
      gclid: value(searchParams, "gclid"),
      fbclid: value(searchParams, "fbclid"),
    };
    const hasCampaignData = Object.entries(attribution).some(([key, item]) => key !== "referrer" && item);
    let hasExternalReferrer = false;
    try {
      hasExternalReferrer = attribution.referrer
        ? new URL(attribution.referrer).hostname !== window.location.hostname
        : false;
    } catch {
      hasExternalReferrer = false;
    }

    if (hasCampaignData || hasExternalReferrer) {
      sessionStorage.setItem(attributionStorageKey, JSON.stringify(attribution));
    }
  }, [pathname, searchParams]);

  return null;
}
