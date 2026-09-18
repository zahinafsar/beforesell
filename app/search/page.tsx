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
  const query = new URLSearchParams(Object.entries(params).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
  const path = `/search${query.size > 0 ? `?${query.toString()}` : ""}`;

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
        path,
        noIndex: true,
      });
    }
  }

  if (searchTerm) {
    return generatePageMetadata({
      title: `Search results for "${searchTerm}"`,
      description: `Find ${searchTerm} on BeforeSell. Browse listings in Bangladesh's trusted marketplace.`,
      path,
      noIndex: true,
    });
  }

  return generatePageMetadata({
    title: "Search Listings",
    description: "Search new and second-hand listings on BeforeSell. Find electronics, vehicles, furniture, property and more in Bangladesh.",
    path,
    noIndex: true,
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
