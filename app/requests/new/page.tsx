import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductRequestForm } from "@/components/product-request-form";
import { Button } from "@/components/ui/button";

export const metadata = { robots: { index: false, follow: false } };

interface NewRequestPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function NewRequestPage({ searchParams }: NewRequestPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/requests/new");
  }

  const { id } = await searchParams;

  const [categories, locations, productRequest] = await Promise.all([
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        parentId: true,
        children: { select: { id: true, name: true }, orderBy: { name: "asc" } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({
      select: { id: true, address: true },
      orderBy: { address: "asc" },
    }),
    id
      ? prisma.productRequest.findFirst({
          where: { id, userId: user.id, status: { not: "DELETED" } },
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            minBudget: true,
            maxBudget: true,
            phone: true,
            status: true,
            categoryId: true,
            locationId: true,
          },
        })
      : null,
  ]);

  let productRequestForForm;
  if (productRequest && productRequest.status !== "DELETED") {
    productRequestForForm = { ...productRequest, status: productRequest.status };
  }

  return (
    <div className="container px-4 py-8 max-w-3xl">
      <div className="mb-6 flex items-center gap-4">
        <Button asChild variant="outline" size="icon" aria-label="Back to my requests">
          <Link href="/dashboard/requests"><ArrowLeft /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {productRequest ? "Edit Request" : "Request a Product"}
          </h1>
          {!productRequest && (
            <p className="mt-1 text-sm text-muted-foreground">
              Tell sellers what you are looking for and share the link anywhere.
            </p>
          )}
        </div>
      </div>
      <ProductRequestForm
        categories={categories}
        locations={locations}
        productRequest={productRequestForForm}
        userPhone={user.phone}
      />
    </div>
  );
}
