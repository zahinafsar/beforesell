import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/seo";
import { BLOG_POSTS } from "@/lib/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  const [listings, categories, users] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 50000,
    }),
    prisma.category.findMany({
      select: { slug: true, updatedAt: true },
    }),
    prisma.user.findMany({
      where: {
        listings: { some: { status: "ACTIVE" } },
      },
      select: { id: true, updatedAt: true },
      take: 10000,
    }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.flatMap((post) => {
    const enUrl = `${baseUrl}/en/${post.en.slug}`;
    const bnUrl = `${baseUrl}/bn/${post.bn.slug}`;
    const alternates = { languages: { en: enUrl, bn: bnUrl } };
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
    url: `${baseUrl}/listings/${listing.id}`,
    lastModified: listing.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const userPages: MetadataRoute.Sitemap = users.map((user) => ({
    url: `${baseUrl}/user/${user.id}`,
    lastModified: user.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...blogPages, ...categoryPages, ...listingPages, ...userPages];
}
