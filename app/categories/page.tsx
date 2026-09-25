import Link from "next/link";
import { ArrowRight, ChevronRight, Search } from "lucide-react";
import { CategoryIllustration } from "@/components/category-illustration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";
import { generatePageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = generatePageMetadata({
  title: "Browse Buy & Sell Categories in Bangladesh",
  description: "Browse BeforeSell categories for new and second-hand products in Bangladesh. Find electronics, vehicles, furniture, fashion and more, or post a free ad.",
  path: "/categories",
});

export default async function CategoriesPage() {
  const [categories, listingCounts] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        children: {
          select: { id: true, name: true, slug: true },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.listing.groupBy({
      by: ["categoryId"],
      where: { status: "ACTIVE" },
      _count: { _all: true },
    }),
  ]);

  const countsByCategory = new Map(
    listingCounts.map((count) => [count.categoryId, count._count._all])
  );
  const categoriesWithCounts = categories.map((category) => ({
    ...category,
    listingCount: [category.id, ...category.children.map((child) => child.id)]
      .reduce((total, id) => total + (countsByCategory.get(id) ?? 0), 0),
  }));
  const categoriesWithChildren = categoriesWithCounts.filter(
    (category) => category.children.length > 0
  );

  return (
    <div className="flex flex-col bg-white">
      <section>
        <div className="container px-4 pt-8 pb-10 md:pt-10 md:pb-14">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-[#014069]/65 md:mb-12">
            <Link href="/" className="transition-colors hover:text-[#014069] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#014069]">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <span aria-current="page" className="font-medium text-[#014069]">Categories</span>
          </nav>

          <div className="grid items-end gap-8 lg:grid-cols-2 lg:gap-16">
            <header className="space-y-5">
              <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-primary md:text-6xl lg:text-7xl">
                Browse All<br />
                <span className="font-serif font-bold italic">Categories</span>
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-neutral-600 md:text-lg">
                From everyday essentials to your next big purchase. Find new and
                second-hand products to buy and sell in Bangladesh.
              </p>
            </header>

            <div className="space-y-3 lg:pb-1">
              <form action="/search" role="search">
                <label htmlFor="category-directory-search" className="mb-3 block text-sm font-semibold text-[#014069]">
                  Already know what you&apos;re looking for?
                </label>
                <div className="flex border border-primary/20 bg-white p-1.5 shadow-lg shadow-primary/5">
                  <div className="relative min-w-0 flex-1">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
                    <Input
                      id="category-directory-search"
                      type="search"
                      name="search"
                      placeholder="Search phones, furniture and more"
                      className="h-12 border-0 bg-transparent pl-12 text-base shadow-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30"
                    />
                  </div>
                  <Button type="submit" size="lg" className="h-12 px-4 text-sm font-semibold sm:px-6">
                    Search
                  </Button>
                </div>
              </form>
              <Link href="/search" className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-primary hover:underline">
                Browse all listings <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="all-categories-heading">
        <div className="container px-4 pb-12 md:pb-16">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-t border-[#014069]/10 pt-8">
            <h2 id="all-categories-heading" className="text-2xl font-bold text-[#014069]">Find Your Category</h2>
            <p className="text-sm text-[#014069]/65">{categories.length} categories to explore</p>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {categoriesWithCounts.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group flex aspect-square flex-col overflow-hidden border border-[#014069]/15 bg-white transition-colors hover:border-[#014069] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#014069]"
                >
                  <CategoryIllustration slug={category.slug} iconName={category.icon} />
                  <div className="flex min-h-16 shrink-0 items-center justify-between gap-2 border-t border-[#014069]/10 bg-[#f5f8fa] px-3 py-2.5">
                    <div className="min-w-0 space-y-1">
                      <h3 className="text-sm font-semibold leading-tight text-[#014069]">{category.name}</h3>
                      <p className="text-xs text-[#014069]/65">
                        {category.listingCount.toLocaleString("en-BD")} {category.listingCount === 1 ? "ad" : "ads"}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[#014069]/45 transition-colors group-hover:text-[#014069]" aria-hidden="true" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="border border-[#014069]/15 p-6 text-neutral-600">Categories will appear here when they are available. You can still browse all listings using the search above.</p>
          )}
        </div>
      </section>

      {categoriesWithChildren.length > 0 && (
        <section aria-labelledby="subcategories-heading" className="border-y border-[#014069]/10 bg-[#f5f8fa]">
          <div className="container px-4 py-12 md:py-16">
            <header className="mb-6 space-y-2">
              <h2 id="subcategories-heading" className="text-2xl font-bold text-[#014069] md:text-3xl">Looking for Something Specific?</h2>
              <p className="text-sm text-[#014069]/65 md:text-base">Go straight to the items you have in mind.</p>
            </header>

            <div className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoriesWithChildren.map((category) => (
                <section key={category.id} aria-labelledby={`subcategory-${category.slug}`} className="border border-[#014069]/15 bg-white">
                  <h3 id={`subcategory-${category.slug}`}>
                    <Link href={`/categories/${category.slug}`} className="group flex min-h-16 items-center justify-between gap-3 border-b border-[#014069]/10 px-5 py-4 text-lg font-semibold text-[#014069] transition-colors hover:bg-[#f5f8fa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#014069]">
                      {category.name}
                      <ArrowRight className="h-4 w-4 shrink-0 text-[#014069]/45 transition-colors group-hover:text-[#014069]" aria-hidden="true" />
                    </Link>
                  </h3>
                  <ul className="divide-y divide-[#014069]/10 px-5">
                    {category.children.map((child) => {
                      const listingCount = countsByCategory.get(child.id) ?? 0;
                      return (
                        <li key={child.id}>
                          <Link href={`/categories/${child.slug}`} className="group flex min-h-12 items-center justify-between gap-3 py-3 text-sm text-[#014069] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#014069]">
                            <span>{child.name}</span>
                            <span className="flex shrink-0 items-center gap-2">
                              <span className="text-xs text-[#014069]/65">{listingCount.toLocaleString("en-BD")} {listingCount === 1 ? "ad" : "ads"}</span>
                              <ChevronRight className="h-3.5 w-3.5 text-[#014069]/45 transition-colors group-hover:text-[#014069]" aria-hidden="true" />
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-primary text-primary-foreground">
        <div className="container flex flex-col gap-6 px-4 py-12 md:flex-row md:items-center md:justify-between md:gap-12">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold md:text-3xl">Buy or Sell Anything</h2>
            <p className="max-w-xl text-primary-foreground/80">Post a free ad to sell your product, or post a free request for the product you want to buy.</p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-3">
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" size="lg" className="h-12 border-white bg-white px-8 font-semibold text-primary hover:bg-white/90 hover:text-primary">
                <Link href="/listings/new">Sell a Product <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 border-white bg-white px-8 font-semibold text-primary hover:bg-white/90 hover:text-primary">
                <Link href="/requests/new">Request a Product <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-x-6">
              <Link href="/sell-used-products-in-bangladesh" className="inline-flex min-h-10 items-center text-sm text-primary-foreground/90 underline underline-offset-4 hover:text-primary-foreground">
                Read our selling guide
              </Link>
              <Link href="/en/request-a-product-you-cant-find" className="inline-flex min-h-10 items-center text-sm text-primary-foreground/90 underline underline-offset-4 hover:text-primary-foreground">
                Read our request guide
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
