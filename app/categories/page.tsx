import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { generatePageMetadata } from "@/lib/seo";
import { CategoryIcon } from "@/components/category-icon";

export const metadata: Metadata = generatePageMetadata({
  title: "All Categories",
  description: "Browse all categories on BeforeSell. Find electronics, vehicles, property, jobs, fashion, and more in Bangladesh.",
  path: "/categories",
});

export default async function CategoriesPage() {
  const categoriesRaw = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: { orderBy: { name: "asc" } },
    },
    orderBy: { name: "asc" },
  });

  const counts = await Promise.all(
    categoriesRaw.map((c) =>
      prisma.listing.count({
        where: {
          status: "ACTIVE",
          categoryId: { in: [c.id, ...c.children.map((ch) => ch.id)] },
        },
      })
    )
  );
  const categories = categoriesRaw.map((c, i) => ({ ...c, listingCount: counts[i] }));

  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Categories</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="border bg-card overflow-hidden"
          >
            <Link
              href={`/search?categoryId=${category.id}`}
              className="relative block h-32 group overflow-hidden"
            >
              {category.image && (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 h-1/4 backdrop-blur-md bg-black/30" />
              <div className="absolute inset-0 p-4 flex flex-col justify-end gap-1 text-white">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
                    <CategoryIcon iconName={category.icon} className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold leading-tight">{category.name}</h2>
                    <p className="text-xs text-white/80">{category.listingCount} ads</p>
                  </div>
                </div>
              </div>
            </Link>
            {category.children.length > 0 && (
              <div className="p-4 space-y-1">
                {category.children.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/search?categoryId=${sub.id}`}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
