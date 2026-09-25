import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBudgetRange } from "@/lib/utils";
import { BoostListingForm } from "@/components/boost-listing-form";

interface BoostRequestPageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: "Boost your request",
  description: "Configure a BeforeSell promotion for your product request.",
  robots: { index: false, follow: false },
};

export default async function BoostRequestPage({ params }: BoostRequestPageProps) {
  const user = await getCurrentUser();
  const { slug } = await params;

  if (!user) {
    redirect(`/login?redirect=/requests/${slug}/boost`);
  }

  const locations = await prisma.location.findMany({
    select: { address: true },
    orderBy: { address: "asc" },
  });

  const productRequest = await prisma.productRequest.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      minBudget: true,
      maxBudget: true,
      userId: true,
      status: true,
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

  if (!productRequest || productRequest.userId !== user.id || productRequest.status === "DELETED") {
    notFound();
  }

  if (productRequest.status !== "OPEN") {
    redirect(`/requests/${productRequest.slug}`);
  }

  const latestPromotion = productRequest.promotions[0];

  return (
    <BoostListingForm
      target={{
        kind: "request",
        id: productRequest.id,
        href: `/requests/${productRequest.slug}`,
        title: productRequest.title,
        priceLabel: formatBudgetRange(productRequest.minBudget, productRequest.maxBudget),
        category: productRequest.category?.name ?? "Wanted",
        images: [],
      }}
      locations={locations.map((location) => location.address)}
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
