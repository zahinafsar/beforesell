import type { Metadata } from "next";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import { generateCategoryMetadata, generateBreadcrumbJsonLd, getBaseUrl, serializeJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const PAGE_SIZE = 24;
const getCategory = cache(async (slug: string) => {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      parent: { select: { name: true, slug: true } },
      children: { select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } },
    },
  });
  if (!category) notFound();
  return category;
});

const getListingCount = cache(async (slug: string) => {
  const category = await getCategory(slug);
  return prisma.listing.count({
    where: {
      status: "ACTIVE",
      categoryId: { in: [category.id, ...category.children.map((child) => child.id)] },
    },
  });
});

function getPage(value: string | string[] | undefined): number {
  if (value === undefined) return 1;
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) notFound();
  const page = Number(value);
  if (!Number.isSafeInteger(page) || page > Math.floor(Number.MAX_SAFE_INTEGER / PAGE_SIZE)) notFound();
  return page;
}

function redirectFilteredCategory(categoryId: string, query: Record<string, string | string[] | undefined>) {
  const filterKeys = new Set(["search", "categoryId", "locationId", "minPrice", "maxPrice", "sort", "featured"]);
  if (!Object.keys(query).some((key) => filterKeys.has(key) || key.startsWith("attr_"))) return;

  const filters = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (key === "categoryId" || value === undefined) continue;
    if (Array.isArray(value)) {
      for (const entry of value) filters.append(key, entry);
    } else {
      filters.set(key, value);
    }
  }
  filters.set("categoryId", categoryId);
  redirect(`/search?${filters.toString()}`);
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = await getCategory(slug);
  redirectFilteredCategory(category.id, query);
  const page = getPage(query.page);
  const listingCount = await getListingCount(slug);
  if (page > Math.max(1, Math.ceil(listingCount / PAGE_SIZE))) notFound();
  return generateCategoryMetadata({
    categoryName: category.name,
    slug,
    listingCount,
    parentCategory: category.parent?.name,
    page,
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = await getCategory(slug);

  redirectFilteredCategory(category.id, query);

  const page = getPage(query.page);
  const listingCount = await getListingCount(slug);
  const pageCount = Math.max(1, Math.ceil(listingCount / PAGE_SIZE));
  if (page > pageCount) notFound();

  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      categoryId: { in: [category.id, ...category.children.map((child) => child.id)] },
    },
    select: {
      id: true, title: true, slug: true, price: true, negotiable: true, status: true, createdAt: true,
      images: { select: { url: true }, orderBy: { order: "asc" }, take: 1 },
      location: { select: { address: true } },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
  });

  const baseUrl = getBaseUrl();
  const pagePath = `/categories/${slug}${page > 1 ? `?page=${page}` : ""}`;
  const breadcrumbs = [
    { name: "Home", url: baseUrl },
    { name: "Categories", url: `${baseUrl}/categories` },
    ...(category.parent ? [{ name: category.parent.name, url: `${baseUrl}/categories/${category.parent.slug}` }] : []),
    { name: category.name, url: `${baseUrl}/categories/${slug}` },
  ];
  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} for sale in Bangladesh`,
    url: `${baseUrl}${pagePath}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: listings.length,
      itemListElement: listings.map((listing, index) => ({
        "@type": "ListItem",
        position: (page - 1) * PAGE_SIZE + index + 1,
        name: listing.title,
        url: `${baseUrl}/listings/${listing.slug}`,
      })),
    },
  };
  const pageUrl = (number: number) => `/categories/${slug}${number > 1 ? `?page=${number}` : ""}`;

  return (
    <div className="container px-4 py-10 space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(generateBreadcrumbJsonLd(breadcrumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(collection) }} />
      <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-muted-foreground">
        {breadcrumbs.map((item, index) => (
          <span key={item.url} className="flex gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {index === breadcrumbs.length - 1 ? <span aria-current="page">{item.name}</span> : <Link href={item.url} className="hover:underline">{item.name}</Link>}
          </span>
        ))}
      </nav>
      <header className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">Buy &amp; Sell {category.name} in Bangladesh</h1>
        <p className="max-w-3xl text-muted-foreground">
          Browse {listingCount.toLocaleString("en-BD")} active {category.name.toLowerCase()} ads on BeforeSell.
          Compare asking prices, check each item&apos;s description and location, and contact the seller directly.
          Have an item to sell? Post a basic ad for free.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild><Link href="/post">Post Free Ad</Link></Button>
          <Button asChild variant="outline"><Link href={`/search?categoryId=${category.id}`}>Search &amp; Filter</Link></Button>
        </div>
      </header>
      {category.children.length > 0 && (
        <section className="space-y-3" aria-labelledby="subcategories-heading">
          <h2 id="subcategories-heading" className="text-xl font-semibold">Browse {category.name} Categories</h2>
          <div className="flex flex-wrap gap-3">
            {category.children.map((child) => (
              <Link key={child.id} href={`/categories/${child.slug}`} className="border px-4 py-2 text-sm hover:border-primary hover:text-primary">{child.name}</Link>
            ))}
          </div>
        </section>
      )}
      <section className="space-y-4" aria-labelledby="listings-heading">
        <h2 id="listings-heading" className="text-2xl font-semibold">{category.name} Listings{page > 1 ? ` — Page ${page}` : ""}</h2>
        {listings.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
          </div>
        ) : <p className="py-8 text-muted-foreground">No active ads in this category yet. You can post the first one.</p>}
      </section>
      {pageCount > 1 && (
        <nav aria-label="Listings pagination" className="flex items-center justify-between gap-4">
          {page > 1 ? <Link href={pageUrl(page - 1)} rel="prev" className="text-primary hover:underline">Previous page</Link> : <span />}
          <span className="text-sm text-muted-foreground">Page {page} of {pageCount}</span>
          {page < pageCount ? <Link href={pageUrl(page + 1)} rel="next" className="text-primary hover:underline">Next page</Link> : <span />}
        </nav>
      )}
      <p className="text-sm text-muted-foreground">
        New to selling? <Link href="/sell-used-products-in-bangladesh" className="text-primary hover:underline">Read our selling guide</Link>.
        {" "}Before meeting a buyer or seller, review our <Link href="/safety" className="text-primary hover:underline">safety tips</Link>.
      </p>
    </div>
  );
}
