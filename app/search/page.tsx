import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { generatePageMetadata } from "@/lib/seo";
import { SearchClient } from "@/components/search-client";

interface SearchParams {
  search?: string;
  categoryId?: string;
  divisionId?: string;
  districtId?: string;
  minPrice?: string;
  maxPrice?: string;
  condition?: string;
  sort?: string;
  page?: string;
}

interface Props {
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const searchTerm = params.search;

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

  const [categories, divisions] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      include: { children: true },
      orderBy: { name: "asc" },
    }),
    prisma.division.findMany({
      include: { districts: { orderBy: { name: "asc" } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="container py-6">
      <SearchClient
        categories={categories}
        divisions={divisions}
        initialParams={params}
      />
    </div>
  );
}
