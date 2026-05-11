export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/listing-card";
import { CategoryIcon } from "@/components/category-icon";
import { HeroCollage } from "@/components/hero-collage";

export default async function HomePage() {
  const [categoriesRaw, featuredListings, recentListings, stats] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: { select: { id: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.listing.findMany({
      where: { status: "ACTIVE", featured: true },
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        location: true,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.listing.findMany({
      where: { status: "ACTIVE" },
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        location: true,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    Promise.all([
      prisma.listing.count({ where: { status: "ACTIVE" } }),
      prisma.user.count(),
    ]),
  ]);

  const [listingCount, userCount] = stats;

  const categoryCounts = await Promise.all(
    categoriesRaw.map((c) =>
      prisma.listing.count({
        where: {
          status: "ACTIVE",
          categoryId: { in: [c.id, ...c.children.map((ch) => ch.id)] },
        },
      })
    )
  );
  const categories = categoriesRaw.map((c, i) => ({ ...c, listingCount: categoryCounts[i] }));

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="container px-4 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left content */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 text-primary text-sm font-semibold uppercase tracking-wider">
                <span className="h-px w-8 bg-primary" />
                Start Selling Today
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-primary leading-[1.05]">
                Buy, Sell &<br />
                <span className="italic font-serif font-bold">Trade Anything</span>
              </h1>

              <p className="text-base md:text-lg text-neutral-600 max-w-md leading-relaxed">
                Bangladesh&apos;s fastest-growing classifieds marketplace. From electronics to estates — your next deal is one click away.
              </p>

              <div className="flex flex-wrap items-center gap-6">
                <Button asChild size="lg" className="h-14 px-8 text-base font-semibold">
                  <Link href="/listings/new">Post Free Ad</Link>
                </Button>

                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="h-9 w-9 border-2 border-white bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">A</div>
                    <div className="h-9 w-9 border-2 border-white bg-primary/40 flex items-center justify-center text-xs font-bold text-primary">M</div>
                    <div className="h-9 w-9 border-2 border-white bg-primary/60 flex items-center justify-center text-xs font-bold text-white">S</div>
                  </div>
                  <div className="text-sm">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                      <span className="ml-1 font-bold text-neutral-900">4.8</span>
                    </div>
                    <p className="text-xs text-neutral-600">from {userCount.toLocaleString()}+ users</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right collage */}
            <HeroCollage />
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Browse Categories</h2>
            <Button variant="ghost" asChild>
              <Link href="/categories">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/search?categoryId=${category.id}`}
                className="relative overflow-hidden border bg-card aspect-square group hover:border-primary transition-colors"
              >
                {category.image && (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 h-1/4 backdrop-blur-md bg-black/30" />
                <div className="absolute inset-0 p-3 flex flex-col justify-between text-white">
                  <div className="h-9 w-9 bg-white/15 backdrop-blur flex items-center justify-center">
                    <CategoryIcon iconName={category.icon} className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm leading-tight">{category.name}</p>
                    <p className="text-xs text-white/80">{category.listingCount} ads</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      {featuredListings.length > 0 && (
        <section className="py-12 bg-muted/50">
          <div className="container px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Featured Listings</h2>
              <Button variant="ghost" asChild>
                <Link href="/search?featured=true">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Listings */}
      <section className="py-12">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Listings</h2>
            <Button variant="ghost" asChild>
              <Link href="/search">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          {recentListings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No listings yet. Be the first to post!</p>
              <Button asChild className="mt-4">
                <Link href="/listings/new">Post Your Ad</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="container px-4 text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold">Ready to Sell?</h2>
          <p className="text-primary-foreground/80">
            Post your ad for free and reach thousands of buyers
          </p>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/listings/new">Post Free Ad</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
