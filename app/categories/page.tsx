import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { generatePageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = generatePageMetadata({
  title: "Browse Buy & Sell Categories in Bangladesh",
  description: "Browse BeforeSell categories for new and second-hand products in Bangladesh. Find electronics, vehicles, furniture, fashion and more, or post a free ad.",
  path: "/categories",
});

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    select: {
      name: true, slug: true,
      children: { select: { name: true, slug: true }, orderBy: { name: "asc" } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container px-4 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">Buy &amp; Sell Categories in Bangladesh</h1>
        <p className="max-w-2xl text-muted-foreground">Choose a category to browse BeforeSell ads or find a place to list your own item. Open a listing to see its asking price, location and seller details.</p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <section key={category.slug} className="border p-6 space-y-4">
            <h2 className="text-xl font-semibold"><Link href={`/categories/${category.slug}`} className="text-primary hover:underline">{category.name}</Link></h2>
            {category.children.length > 0 && (
              <ul className="space-y-2 text-sm">
                {category.children.map((child) => <li key={child.slug}><Link href={`/categories/${child.slug}`} className="hover:underline">{child.name}</Link></li>)}
              </ul>
            )}
          </section>
        ))}
      </div>
      <Link href="/sell-used-products-in-bangladesh" className="inline-block text-primary hover:underline">Learn how to sell a used product on BeforeSell</Link>
    </div>
  );
}
