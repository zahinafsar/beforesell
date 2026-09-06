import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PromotionPaymentForm } from "@/components/promotion-payment-form";

interface PromotionPaymentPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Pay for your promotion",
  description: "Submit your bKash payment for a BeforeSell listing promotion.",
};

export default async function PromotionPaymentPage({ params }: PromotionPaymentPageProps) {
  const user = await getCurrentUser();
  const { id } = await params;

  if (!user) {
    redirect(`/login?redirect=/promotions/${id}/payment`);
  }

  const promotion = await prisma.listingPromotion.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      status: true,
      totalBudget: true,
      durationDays: true,
      listing: { select: { title: true, slug: true } },
      payment: {
        select: {
          status: true,
          provider: true,
          recipientNumber: true,
          amount: true,
          transactionId: true,
          submittedAt: true,
          approvedAt: true,
        },
      },
    },
  });

  if (!promotion || promotion.userId !== user.id || !promotion.payment) {
    notFound();
  }

  return (
    <PromotionPaymentForm
      promotion={{
        id: promotion.id,
        status: promotion.status,
        totalBudget: promotion.totalBudget,
        durationDays: promotion.durationDays,
        listing: promotion.listing,
        payment: {
          ...promotion.payment,
          submittedAt: promotion.payment.submittedAt?.toISOString() ?? null,
          approvedAt: promotion.payment.approvedAt?.toISOString() ?? null,
        },
      }}
    />
  );
}
