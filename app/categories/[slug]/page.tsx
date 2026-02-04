import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const search = await searchParams;

  const category = await prisma.category.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!category) {
    redirect("/search");
  }

  // Build redirect URL with all existing search params
  const queryParams = new URLSearchParams();
  queryParams.set("categoryId", category.id);

  Object.entries(search).forEach(([key, value]) => {
    if (value && key !== "categoryId") {
      queryParams.set(key, value);
    }
  });

  redirect(`/search?${queryParams.toString()}`);
}
