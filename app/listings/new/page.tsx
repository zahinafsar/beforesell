import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListingForm } from "@/components/listing-form";

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

  const [categories, divisions, listing] = await Promise.all([
    prisma.category.findMany({
      include: { children: true },
      orderBy: { name: "asc" },
    }),
    prisma.division.findMany({
      include: { districts: { orderBy: { name: "asc" } } },
      orderBy: { name: "asc" },
    }),
    listingId
      ? prisma.listing.findUnique({
          where: { id: listingId, userId: user.id },
          include: {
            images: { orderBy: { order: "asc" } },
            district: true,
          },
        })
      : null,
  ]);

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">
        {listing ? "Add Images to Your Listing" : "Post a New Ad"}
      </h1>
      <ListingForm
        categories={categories}
        divisions={divisions}
        listing={listing || undefined}
      />
    </div>
  );
}
