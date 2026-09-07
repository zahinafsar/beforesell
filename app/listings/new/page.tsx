import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListingForm } from "@/components/listing-form";
import { Button } from "@/components/ui/button";

interface NewListingPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function NewListingPage({ searchParams }: NewListingPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/listings/new");
  }

  const params = await searchParams;
  const listingId = params.id;

  const [categories, locations, listing] = await Promise.all([
    prisma.category.findMany({
      include: { children: true },
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({
      orderBy: { address: "asc" },
    }),
    listingId
      ? prisma.listing.findUnique({
          where: { id: listingId, userId: user.id },
          include: {
            images: { orderBy: { order: "asc" } },
            attributeValues: {
              include: {
                attribute: { select: { slug: true } },
              },
            },
          },
        })
      : null,
  ]);

  return (
    <div className="container px-4 py-8 max-w-3xl">
      <div className="mb-6 flex items-center gap-4">
        <Button asChild variant="outline" size="icon" aria-label="Back to my listings">
          <Link href="/dashboard/listings"><ArrowLeft /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {listing ? "Edit Listing" : "Post a New Ad"}
          </h1>
        </div>
      </div>
      <ListingForm
        categories={categories}
        locations={locations}
        listing={listing || undefined}
        userPhone={user.phone}
      />
    </div>
  );
}
