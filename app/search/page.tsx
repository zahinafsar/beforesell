import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { generatePageMetadata } from "@/lib/seo";
import { ListingsBrowser } from "@/components/listings-browser";

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const searchTerm = params.search;
  const categoryId = params.categoryId;

  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { parent: true },
    });

    if (category) {
      const categoryName = category.parent
        ? `${category.name} in ${category.parent.name}`
        : category.name;

      return generatePageMetadata({
        title: categoryName,
        description: `Browse ${category.name} listings on BeforeSell. Find the best deals in Bangladesh.`,
        path: `/search?categoryId=${categoryId}`,
      });
    }
  }

  if (searchTerm) {
    return generatePageMetadata({
      title: `Search results for "${searchTerm}"`,
      description: `Find ${searchTerm} on BeforeSell. Browse listings in Bangladesh's trusted marketplace.`,
      path: `/search?search=${encodeURIComponent(searchTerm)}`,
    });
  }

  return generatePageMetadata({
    title: "Search Listings",
    description: "Search and browse thousands of listings on BeforeSell. Find electronics, vehicles, property, and more in Bangladesh.",
    path: "/search",
  });
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;

  const [categories, locations] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      include: { children: true },
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({
      orderBy: { address: "asc" },
    }),
  ]);

  return (
    <div className="container px-4 py-6">
      <ListingsBrowser
        categories={categories}
        locations={locations}
        initialParams={params}
      />
    </div>
  );
}
