interface PromotionTargetSource {
  listing?: { title: string; slug: string; images?: { url: string }[] } | null;
  request?: { title: string; slug: string } | null;
}

export interface PromotionTarget {
  kind: "listing" | "request";
  title: string;
  href: string;
  boostHref: string;
  image: string | null;
}

export function getPromotionTarget(source: PromotionTargetSource): PromotionTarget {
  if (source.request) {
    return {
      kind: "request",
      title: source.request.title,
      href: `/requests/${source.request.slug}`,
      boostHref: `/requests/${source.request.slug}/boost`,
      image: null,
    };
  }

  if (source.listing) {
    return {
      kind: "listing",
      title: source.listing.title,
      href: `/listings/${source.listing.slug}`,
      boostHref: `/listings/${source.listing.slug}/boost`,
      image: source.listing.images?.[0]?.url ?? null,
    };
  }

  return { kind: "listing", title: "Unavailable", href: "/", boostHref: "/", image: null };
}
