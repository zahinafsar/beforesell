import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { generateCategoryMetadata, generateBreadcrumbJsonLd, getBaseUrl } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import CategoryListings from "@/components/category-listings";
import CategoryIcon from "@/components/category-icon";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    condition?: string;
    minPrice?: string;
    maxPrice?: string;
    divisionId?: string;
    districtId?: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      parent: true,
      _count: { select: { listings: { where: { status: "ACTIVE" } } } },
    },
  });

  if (!category) {
    return { title: "Category Not Found" };
  }

  return generateCategoryMetadata({
    categoryName: category.name,
    slug: category.slug,
    listingCount: category._count.listings,
    parentCategory: category.parent?.name,
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const search = await searchParams;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      parent: true,
      children: {
        include: {
          _count: { select: { listings: { where: { status: "ACTIVE" } } } },
        },
        orderBy: { name: "asc" },
      },
      _count: { select: { listings: { where: { status: "ACTIVE" } } } },
    },
  });

  if (!category) {
    notFound();
  }

  const divisions = await prisma.division.findMany({
    include: { districts: { orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  });

  const isSubcategory = !!category.parentId;
  const iconName = category.parent?.icon || (category as { icon: string | null }).icon;

  const baseUrl = getBaseUrl();
  const breadcrumbItems = [
    { name: "Home", url: baseUrl },
    { name: "Categories", url: `${baseUrl}/categories` },
    ...(category.parent
      ? [{ name: category.parent.name, url: `${baseUrl}/categories/${category.parent.slug}` }]
      : []),
    { name: category.name, url: `${baseUrl}/categories/${category.slug}` },
  ];
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbItems);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="container py-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/categories" className="hover:text-foreground">
            Categories
          </Link>
          {category.parent && (
            <>
              <ChevronRight className="h-4 w-4" />
              <Link
                href={`/categories/${category.parent.slug}`}
                className="hover:text-foreground"
              >
                {category.parent.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{category.name}</span>
        </nav>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <CategoryIcon iconName={iconName} className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{category.name}</h1>
            <p className="text-muted-foreground">
              {category._count.listings} ads in this category
            </p>
          </div>
        </div>

        {!isSubcategory && category.children.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <Link href={`/categories/${category.slug}`}>
                <Badge variant="default" className="cursor-pointer">
                  All {category.name}
                </Badge>
              </Link>
              {category.children.map((sub) => (
                <Link key={sub.id} href={`/categories/${sub.slug}`}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                  >
                    {sub.name} ({sub._count.listings})
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        <CategoryListings
          categoryId={category.id}
          divisions={divisions}
          initialParams={search}
        />
      </div>
    </>
  );
}
