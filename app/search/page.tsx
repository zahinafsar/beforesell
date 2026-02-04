import { prisma } from "@/lib/prisma";
import SearchClient from "@/components/search-client";

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
