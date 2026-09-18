import { Metadata } from "next";
import type { BlogPost, BlogLang } from "@/lib/blog";
import type { ListingStatus } from "@prisma/client";

const SITE_NAME = "BeforeSell";
const SITE_URL = getSiteOrigin();
export const DEFAULT_DESCRIPTION = "Buy and sell new and second-hand products in Bangladesh on BeforeSell. Post a free ad for phones, electronics, furniture, vehicles and more.";
export const DEFAULT_SOCIAL_IMAGE = "/social-image";

function getSiteOrigin(): string {
  const value = process.env.NEXT_PUBLIC_APP_URL;
  if (!value || /\s/.test(value)) {
    throw new Error("NEXT_PUBLIC_APP_URL is required and must be an absolute HTTP(S) origin without whitespace.");
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("NEXT_PUBLIC_APP_URL must be a valid absolute HTTP(S) origin.");
  }

  if (
    !/^https?:\/\//.test(value) ||
    !["http:", "https:"].includes(url.protocol) ||
    url.username || url.password || url.pathname !== "/" || url.search || url.hash
  ) {
    throw new Error("NEXT_PUBLIC_APP_URL must contain only an HTTP(S) origin, without credentials, a path, query or fragment.");
  }

  return url.origin;
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

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
  image = DEFAULT_SOCIAL_IMAGE,
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const url = `${SITE_URL}${path}`;
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;

  return {
    title: { absolute: fullTitle },
    description,
    ...(noIndex && { robots: { index: false, follow: true } }),
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
  listingSlug: string;
  sellerName: string;
  status: ListingStatus;
}

export function generateListingMetadata({
  title,
  description,
  price,
  image,
  location,
  listingSlug,
  sellerName,
  status,
}: ListingMetadataOptions): Metadata {
  const url = `${SITE_URL}/listings/${listingSlug}`;
  const fullTitle = `${title} - ৳${price.toLocaleString("en-BD")} | ${SITE_NAME}`;
  const summary = description.replace(/\s+/g, " ").trim();
  const metaDescription = `${summary.slice(0, 150)}${summary.length > 150 ? "…" : ""} Located in ${location}. Seller: ${sellerName}`;

  return {
    title: { absolute: fullTitle },
    description: metaDescription,
    ...(status !== "ACTIVE" && { robots: { index: false, follow: true } }),
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
  page?: number;
}

export function generateCategoryMetadata({
  categoryName,
  slug,
  listingCount,
  parentCategory,
  page = 1,
}: CategoryMetadataOptions): Metadata {
  const url = `${SITE_URL}/categories/${slug}${page > 1 ? `?page=${page}` : ""}`;
  const title = parentCategory
    ? `${categoryName} in ${parentCategory}`
    : categoryName;
  const fullTitle = `${title} - Buy & Sell in Bangladesh${page > 1 ? ` - Page ${page}` : ""} | ${SITE_NAME}`;
  const description = `Browse ${listingCount} ads in ${categoryName}${parentCategory ? ` (${parentCategory})` : ""}. Find great deals in Bangladesh on ${SITE_NAME}.`;

  return {
    title: { absolute: fullTitle },
    description,
    ...(listingCount === 0 && { robots: { index: false, follow: true } }),
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
    title: { absolute: fullTitle },
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
  listingSlug: string;
  status: ListingStatus;
  condition?: string;
  brand?: string;
}

export function generateListingJsonLd({
  title,
  description,
  price,
  image,
  location,
  listingId,
  sellerName,
  listingSlug,
  status,
  condition,
  brand,
}: ListingJsonLdOptions) {
  const itemCondition = condition === "New"
    ? "https://schema.org/NewCondition"
    : condition && ["Used", "Like New", "Good", "Fair"].includes(condition)
      ? "https://schema.org/UsedCondition"
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    description: description,
    image: image || undefined,
    url: `${SITE_URL}/listings/${listingSlug}`,
    offers: {
      "@type": "Offer",
      price: price,
      priceCurrency: "BDT",
      url: `${SITE_URL}/listings/${listingSlug}`,
      availability: status === "ACTIVE" ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      seller: {
        "@type": "Person",
        name: sellerName,
      },
    },
    sku: listingId,
    ...(itemCondition && { itemCondition }),
    ...(brand && brand !== "Other" && { brand: { "@type": "Brand", name: brand } }),
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Location",
        value: location,
      },
    ],
  };
}

interface BlogMetadataOptions {
  post: BlogPost;
  lang: BlogLang;
}

export function generateBlogMetadata({ post, lang }: BlogMetadataOptions): Metadata {
  const content = post[lang];
  const url = `${SITE_URL}/${lang}/${content.slug}`;
  const enUrl = `${SITE_URL}/en/${post.en.slug}`;
  const bnUrl = `${SITE_URL}/bn/${post.bn.slug}`;
  const fullTitle = `${content.title} | ${SITE_NAME}`;
  const ogLocale = lang === "bn" ? "bn_BD" : "en_BD";
  const image = post.cover || DEFAULT_SOCIAL_IMAGE;

  return {
    title: { absolute: fullTitle },
    description: content.description,
    alternates: {
      canonical: url,
      languages: {
        en: enUrl,
        bn: bnUrl,
        "x-default": enUrl,
      },
    },
    openGraph: {
      title: content.title,
      description: content.description,
      url,
      siteName: SITE_NAME,
      locale: ogLocale,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      ...(image && { images: [{ url: image, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: content.title,
      description: content.description,
      ...(image && { images: [image] }),
    },
  };
}

export function generateBlogJsonLd({ post, lang }: BlogMetadataOptions) {
  const content = post[lang];
  const url = `${SITE_URL}/${lang}/${content.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: content.title,
    description: content.description,
    inLanguage: lang === "bn" ? "bn-BD" : "en-BD",
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.webp`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    ...(post.cover && { image: post.cover.startsWith("http") ? post.cover : `${SITE_URL}${post.cover}` }),
  };
}

export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.webp`,
    description: DEFAULT_DESCRIPTION,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "help.beforesell@gmail.com",
      telephone: "+8801534792218",
      areaServed: "BD",
      availableLanguage: ["English", "Bengali"],
    },
    sameAs: ["https://www.facebook.com/beforesell.official/"],
    areaServed: { "@type": "Country", name: "Bangladesh" },
  };
}

export function generateWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    inLanguage: ["en-BD", "bn-BD"],
    publisher: { "@id": `${SITE_URL}/#organization` },
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
