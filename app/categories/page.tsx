import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { generatePageMetadata } from "@/lib/seo";
import { CategoryIcon } from "@/components/category-icon";

export const metadata: Metadata = generatePageMetadata({
  title: "All Categories",
  description: "Browse all categories on BeforeSell. Find electronics, vehicles, property, jobs, fashion, and more in Bangladesh.",
  path: "/categories",
});

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: { orderBy: { name: "asc" } },
      _count: { select: { listings: { where: { status: "ACTIVE" } } } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Categories</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="border rounded-lg p-6 bg-card"
          >
            <Link
              href={`/search?categoryId=${category.id}`}
              className="flex items-center gap-3 hover:text-primary transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CategoryIcon iconName={category.icon} className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">{category.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {category._count.listings} ads
                </p>
              </div>
            </Link>
            {category.children.length > 0 && (
              <div className="mt-4 pl-13 space-y-1">
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
