import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/seo";
import { BLOG_POSTS } from "@/lib/blog";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  const [listings, categories] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 45000,
    }),
    prisma.category.findMany({
      where: {
        OR: [
          { listings: { some: { status: "ACTIVE" } } },
          { children: { some: { listings: { some: { status: "ACTIVE" } } } } },
        ],
      },
      select: { slug: true },
    }),
  ]);

  const publicPages: MetadataRoute.Sitemap = [
    "/about", "/contact", "/how-it-works", "/safety", "/terms", "/privacy",
    "/sell-used-products-in-bangladesh", "/categories",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.flatMap((post) => {
    const enUrl = `${baseUrl}/en/${post.en.slug}`;
    const bnUrl = `${baseUrl}/bn/${post.bn.slug}`;
    const alternates = { languages: { en: enUrl, bn: bnUrl, "x-default": enUrl } };
    return [
      {
        url: enUrl,
        lastModified: new Date(post.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.8,
        alternates,
      },
      {
        url: bnUrl,
        lastModified: new Date(post.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.8,
        alternates,
      },
    ];
  });

  const listingPages: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: `${baseUrl}/listings/${listing.slug}`,
    lastModified: listing.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...publicPages, ...blogPages, ...categoryPages, ...listingPages];
}
