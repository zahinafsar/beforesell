import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BoostListingForm } from "@/components/boost-listing-form";

interface BoostPageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: "Boost your listing",
  description: "Configure a BeforeSell promotion for your listing.",
};

export default async function BoostListingPage({ params }: BoostPageProps) {
  const user = await getCurrentUser();
  const { slug } = await params;

  if (!user) {
    redirect(`/login?redirect=/listings/${slug}/boost`);
  }

  const listing = await prisma.listing.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      userId: true,
      status: true,
      images: { select: { url: true }, orderBy: { order: "asc" }, take: 4 },
      category: { select: { name: true } },
      promotions: {
        orderBy: { submittedAt: "desc" },
        take: 1,
        select: {
          id: true,
          status: true,
          totalBudget: true,
          durationDays: true,
          submittedAt: true,
          reviewedAt: true,
          reviewNote: true,
          payment: { select: { status: true } },
        },
      },
    },
  });

  if (!listing || listing.userId !== user.id) {
    notFound();
  }

  if (listing.status !== "ACTIVE") {
    redirect(`/listings/${listing.slug}`);
  }

  const latestPromotion = listing.promotions[0];

  return (
    <BoostListingForm
      listing={{
        id: listing.id,
        slug: listing.slug,
        title: listing.title,
        price: listing.price,
        category: listing.category?.name ?? "Marketplace",
        images: listing.images.map((image) => image.url),
      }}
      latestPromotion={
        latestPromotion
          ? {
              ...latestPromotion,
              submittedAt: latestPromotion.submittedAt.toISOString(),
              reviewedAt: latestPromotion.reviewedAt?.toISOString() ?? null,
            }
          : null
      }
    />
  );
}
