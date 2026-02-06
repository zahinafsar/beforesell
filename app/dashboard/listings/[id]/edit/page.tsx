import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListingForm } from "@/components/listing-form";

interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  const [categories, locations, listing] = await Promise.all([
    prisma.category.findMany({
      include: { children: true },
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({
      orderBy: { address: "asc" },
    }),
    prisma.listing.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        attributeValues: {
          include: {
            attribute: { select: { slug: true } },
          },
        },
      },
    }),
  ]);

  if (!listing || listing.userId !== user.id) {
    notFound();
  }

  return (
    <div className="container px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Edit Listing</h1>
      <ListingForm
        categories={categories}
        locations={locations}
        listing={listing}
        userPhone={user.phone}
      />
    </div>
  );
}
