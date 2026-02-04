import { Metadata } from "next";

const SITE_NAME = "BeforeSell";
const SITE_URL = process.env.NEXT_PUBLIC_URL || "https://beforesell.com";
const DEFAULT_DESCRIPTION =
  "Bangladesh's trusted marketplace for buying and selling. Post free ads and find great deals on electronics, vehicles, property, and more.";

export function getBaseUrl(): string {
  return SITE_URL;
}

interface PageMetadataOptions {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}

export function generatePageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "",
  image,
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const url = `${SITE_URL}${path}`;
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    ...(noIndex && { robots: { index: false, follow: false } }),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_BD",
      type: "website",
      ...(image && { images: [{ url: image, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: fullTitle,
      description,
      ...(image && { images: [image] }),
    },
  };
}

interface ListingMetadataOptions {
  title: string;
  description: string;
  price: number;
  image?: string;
  location: string;
  listingId: string;
  sellerName: string;
}

export function generateListingMetadata({
  title,
  description,
  price,
  image,
  location,
  listingId,
  sellerName,
}: ListingMetadataOptions): Metadata {
  const url = `${SITE_URL}/listings/${listingId}`;
  const fullTitle = `${title} - ৳${price.toLocaleString()} | ${SITE_NAME}`;
  const metaDescription = `${description.slice(0, 150)}... Located in ${location}. Seller: ${sellerName}`;

  return {
    title: fullTitle,
    description: metaDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description: metaDescription,
      url,
      siteName: SITE_NAME,
      locale: "en_BD",
      type: "website",
      ...(image && { images: [{ url: image, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: fullTitle,
      description: metaDescription,
      ...(image && { images: [image] }),
    },
  };
}

interface CategoryMetadataOptions {
  categoryName: string;
  slug: string;
  listingCount: number;
  parentCategory?: string;
}

export function generateCategoryMetadata({
  categoryName,
  slug,
  listingCount,
  parentCategory,
}: CategoryMetadataOptions): Metadata {
  const url = `${SITE_URL}/categories/${slug}`;
  const title = parentCategory
    ? `${categoryName} in ${parentCategory}`
    : categoryName;
  const fullTitle = `${title} - Buy & Sell | ${SITE_NAME}`;
  const description = `Browse ${listingCount} ads in ${categoryName}${parentCategory ? ` (${parentCategory})` : ""}. Find great deals in Bangladesh on ${SITE_NAME}.`;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_BD",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description,
    },
  };
}

interface UserMetadataOptions {
  userName: string;
  userId: string;
  listingCount: number;
  memberSince: string;
}

export function generateUserMetadata({
  userName,
  userId,
  listingCount,
  memberSince,
}: UserMetadataOptions): Metadata {
  const url = `${SITE_URL}/user/${userId}`;
  const fullTitle = `${userName}'s Profile | ${SITE_NAME}`;
  const description = `View ${userName}'s profile on ${SITE_NAME}. ${listingCount} active listings. Member since ${memberSince}.`;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_BD",
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description,
    },
  };
}

interface ListingJsonLdOptions {
  title: string;
  description: string;
  price: number;
  image?: string;
  location: string;
  listingId: string;
  sellerName: string;
  createdAt: Date;
  negotiable: boolean;
}

export function generateListingJsonLd({
  title,
  description,
  price,
  image,
  location,
  listingId,
  sellerName,
  createdAt,
  negotiable,
}: ListingJsonLdOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    description: description,
    image: image || undefined,
    offers: {
      "@type": "Offer",
      price: price,
      priceCurrency: "BDT",
      availability: "https://schema.org/InStock",
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      seller: {
        "@type": "Person",
        name: sellerName,
      },
      ...(negotiable && { priceSpecification: { "@type": "PriceSpecification", valueAddedTaxIncluded: true } }),
    },
    sku: listingId,
    brand: {
      "@type": "Brand",
      name: "Various",
    },
    aggregateRating: undefined,
    review: undefined,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Location",
        value: location,
      },
    ],
    datePosted: createdAt.toISOString(),
  };
}

export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: DEFAULT_DESCRIPTION,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Bengali"],
    },
    sameAs: [],
  };
}

export function generateWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
