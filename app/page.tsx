import Link from "next/link";
import { Search, ArrowRight, TrendingUp, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/listing-card";
import { CategoryIcon } from "@/components/category-icon";
import { HeroBackground } from "@/components/hero-background";

const popularSearches = [
  "iPhone",
  "Toyota",
  "Laptop",
  "Apartment",
  "Motorcycle",
  "Samsung",
];

export default async function HomePage() {
  const [categories, featuredListings, recentListings, stats] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      include: {
        _count: { select: { listings: { where: { status: "ACTIVE" } } } },
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

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-primary via-primary to-secondary py-16 md:py-24">
        <HeroBackground />

        <div className="container px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
                Buy & Sell Anything
                <span className="block text-white/90">in Bangladesh</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-xl mx-auto">
                Join thousands of buyers and sellers on Bangladesh&apos;s fastest-growing marketplace
              </p>
            </div>

            {/* Search Form */}
            <form action="/search" className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white rounded-xl shadow-2xl">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    name="search"
                    placeholder="What are you looking for?"
                    className="pl-12 h-14 text-lg border-0 shadow-none focus-visible:ring-0"
                  />
                </div>
                <Button type="submit" size="lg" className="h-14 px-8 text-base font-semibold">
                  Search
                </Button>
              </div>
            </form>

            {/* Popular Searches */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-white/60 text-sm">Popular:</span>
              {popularSearches.map((term) => (
                <Link
                  key={term}
                  href={`/search?search=${encodeURIComponent(term)}`}
                  className="px-3 py-1 text-sm bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
                >
                  {term}
                </Link>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-white mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-2xl font-bold">{listingCount.toLocaleString()}+</span>
                </div>
                <p className="text-xs text-white/60">Active Listings</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-white mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-2xl font-bold">{userCount.toLocaleString()}+</span>
                </div>
                <p className="text-xs text-white/60">Happy Users</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-white mb-1">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-2xl font-bold">100%</span>
                </div>
                <p className="text-xs text-white/60">Free to Use</p>
              </div>
            </div>
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
                className="flex flex-col items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent hover:border-primary transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CategoryIcon iconName={category.icon} className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm">{category.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {category._count.listings} ads
                  </p>
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
