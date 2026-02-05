import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/listing-card";
import { CategoryIcon } from "@/components/category-icon";

export default async function HomePage() {
  const [categories, featuredListings, recentListings] = await Promise.all([
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
  ]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-12 md:py-20">
        <div className="container px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6 px-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Buy & Sell Anything in Bangladesh
            </h1>
            <p className="text-muted-foreground text-lg">
              Find great deals or post your ads for free on BeforeSell
            </p>
            <form action="/search" className="flex gap-2 max-w-lg mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  name="search"
                  placeholder="What are you looking for?"
                  className="pl-10 h-12"
                />
              </div>
              <Button type="submit" size="lg" className="h-12">
                Search
              </Button>
            </form>
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
