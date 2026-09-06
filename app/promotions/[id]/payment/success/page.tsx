import Link from "next/link";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BadgeCheck, Clock3, ExternalLink } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface PaymentSuccessPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Payment submitted",
  description: "Your promotion payment has been submitted for review.",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(value);
}

export default async function PaymentSuccessPage({ params }: PaymentSuccessPageProps) {
  const user = await getCurrentUser();
  const { id } = await params;

  if (!user) {
    redirect(`/login?redirect=/promotions/${id}/payment/success`);
  }

  const promotion = await prisma.listingPromotion.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      totalBudget: true,
      listing: { select: { title: true, slug: true } },
      payment: {
        select: {
          status: true,
          transactionId: true,
          submittedAt: true,
        },
      },
    },
  });

  if (!promotion || promotion.userId !== user.id || !promotion.payment) {
    notFound();
  }

  if (promotion.payment.status === "PENDING" || !promotion.payment.transactionId) {
    redirect(`/promotions/${promotion.id}/payment`);
  }

  const approved = promotion.payment.status === "APPROVED";

  return (
    <main className="container flex min-h-[70vh] max-w-2xl items-center px-4 py-12">
      <Card className="w-full overflow-hidden">
        <div className="h-2 bg-[#e2136e]" />
        <CardHeader className="items-center gap-5 pb-4 text-center">
          <div className="flex mx-auto h-20 w-20 items-center justify-center bg-emerald-500/10 text-emerald-600">
            <BadgeCheck className="h-11 w-11" />
          </div>
          <div className="space-y-2">
            {/* <Badge variant="outline" className={approved ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700" : "border-primary/30 bg-primary/10 text-primary"}>
              {approved ? "Payment approved" : "Payment submitted"}
            </Badge> */}
            <CardTitle className="text-3xl">{approved ? "Your promotion is approved" : "Payment submitted successfully"}</CardTitle>
            <p className="text-base leading-7 text-muted-foreground">
              {approved
                ? "Your payment is confirmed and your listing promotion is ready to run."
                : "We received your bKash transaction ID. An administrator will verify the payment before approving your promotion."}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid border-y sm:grid-cols-3">
            <div className="border-b py-4 sm:border-b-0 sm:border-r sm:pr-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Listing</p>
              <p className="mt-1 truncate font-semibold">{promotion.listing.title}</p>
            </div>
            <div className="border-b py-4 sm:border-b-0 sm:border-r sm:px-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Amount</p>
              <p className="mt-1 font-semibold text-primary">৳{formatNumber(promotion.totalBudget)}</p>
            </div>
            <div className="py-4 sm:pl-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Transaction ID</p>
              <p className="mt-1 truncate font-mono font-semibold">{promotion.payment.transactionId}</p>
            </div>
          </div>
          {/* {!approved ? (
            <div className="mt-6 flex items-start gap-3 bg-primary/5 p-4">
              <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm leading-6 text-muted-foreground">Payment verification is pending. You can check the latest status from the promotion page.</p>
            </div>
          ) : null} */}
        </CardContent>
        <CardFooter className="flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href={`/listings/${promotion.listing.slug}`}>
              View listing
              <ExternalLink />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={`/promotions/${promotion.id}/payment`}>View payment details</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
