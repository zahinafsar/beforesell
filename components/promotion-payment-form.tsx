"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  Clipboard,
  Clock3,
  Loader2,
  LockKeyhole,
  Send,
} from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PaymentStatus = "PENDING" | "SUBMITTED" | "APPROVED";

interface PromotionPaymentFormProps {
  promotion: {
    id: string;
    status: "PENDING_REVIEW" | "PROCESSING" | "APPROVED" | "REJECTED";
    totalBudget: number;
    durationDays: number;
    listing: { title: string; slug: string };
    payment: {
      status: PaymentStatus;
      provider: string;
      recipientNumber: string;
      amount: number;
      transactionId: string | null;
      submittedAt: string | null;
      approvedAt: string | null;
    };
  };
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(value);
}

export function PromotionPaymentForm({ promotion }: PromotionPaymentFormProps) {
  const router = useRouter();
  const [transactionId, setTransactionId] = useState(promotion.payment.transactionId ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const locked = promotion.status === "APPROVED" || promotion.payment.status === "APPROVED";

  async function copyNumber() {
    await navigator.clipboard.writeText(promotion.payment.recipientNumber);
    toast.success("bKash number copied");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api("promotions/[id]/payment", {
        method: "PUT",
        params: { id: promotion.id },
        body: { transactionId },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          "error" in result && typeof result.error === "string"
            ? result.error
            : "Could not submit payment",
        );
      }
      setTransactionId(result.payment.transactionId ?? transactionId.toUpperCase());
      toast.success("Payment submitted for review");
      router.push(`/promotions/${promotion.id}/payment/success`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit payment");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="container max-w-5xl px-4 py-8 sm:py-12">
      <div className="mb-7 flex items-center gap-4">
        <Button asChild variant="outline" size="icon" aria-label="Back to campaign">
          <Link href={`/listings/${promotion.listing.slug}/boost`}><ArrowLeft /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Payment with Bkash</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="pt-0">
          <CardHeader className="bg-[#e2136e] px-6 py-4 gap-0">
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Bkash</span>
              <Image
                src="/payments/bkash-logo.png"
                alt=""
                width={512}
                height={512}
                priority
                className="h-16 w-16 shrink-0 object-contain sm:h-20 sm:w-20"
              />
              <span className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Payment</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-7 pt-6">
            <ol className="space-y-5">
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-primary text-sm font-bold text-primary-foreground">1</span>
                <div><p className="font-semibold">Open bKash and choose Send Money</p><p className="mt-1 text-sm text-muted-foreground">Use your bKash app or dial *247#.</p></div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-primary text-sm font-bold text-primary-foreground">2</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">Send ৳{formatNumber(promotion.payment.amount)} to this number</p>
                  <div className="mt-2 flex items-center justify-between gap-3 border border-primary/20 bg-primary/5 px-4 py-3">
                    <span className="text-xl font-bold tracking-wider text-primary">{promotion.payment.recipientNumber}</span>
                    <Button type="button" variant="outline" size="sm" onClick={copyNumber}><Clipboard />Copy</Button>
                  </div>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-primary text-sm font-bold text-primary-foreground">3</span>
                <div><p className="font-semibold">Enter your bKash transaction ID</p><p className="mt-1 text-sm text-muted-foreground">You will find the transaction ID in the payment confirmation message.</p></div>
              </li>
            </ol>

            <form onSubmit={handleSubmit} className="border-t pt-6">
              <Label htmlFor="transaction-id" className="text-base font-semibold">Transaction ID</Label>
              <Input
                id="transaction-id"
                value={transactionId}
                onChange={(event) => setTransactionId(event.target.value.replace(/\s/g, ""))}
                placeholder="Example: CGH7ABC123"
                className="mt-2 h-12 uppercase tracking-wider"
                minLength={6}
                maxLength={32}
                autoComplete="off"
                disabled={locked || promotion.status === "REJECTED"}
                required
              />
              {locked ? (
                <div className="mt-4 flex items-center gap-3 border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800">
                  <LockKeyhole className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium">This payment has been approved and can no longer be edited.</p>
                </div>
              ) : promotion.status === "REJECTED" ? (
                <p className="mt-3 text-sm text-destructive">This promotion was rejected and cannot accept payment updates.</p>
              ) : (
                <Button type="submit" size="lg" className="mt-4 h-12 w-full text-base" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
                  {isSubmitting ? "Submitting…" : "Submit for review"}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader><CardTitle>Payment summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Listing</p><p className="mt-1 font-semibold">{promotion.listing.title}</p></div>
              <div className="border-y py-4"><p className="text-xs uppercase tracking-wider text-muted-foreground">Campaign</p><p className="mt-1 font-semibold">{promotion.durationDays} days</p></div>
              <div className="flex items-end justify-between"><span className="font-semibold">Amount</span><span className="text-3xl font-bold text-primary">৳{formatNumber(promotion.totalBudget)}</span></div>
            </CardContent>
          </Card>

          {/* <Card>
            <CardContent className="flex items-start gap-3 pt-6">
              {locked ? <BadgeCheck className="h-6 w-6 shrink-0 text-emerald-600" /> : promotion.payment.status === "SUBMITTED" ? <Check className="h-6 w-6 shrink-0 text-primary" /> : <Clock3 className="h-6 w-6 shrink-0 text-amber-600" />}
              <div>
                <Badge variant="outline">{locked ? "Approved" : promotion.payment.status === "SUBMITTED" ? "Submitted" : "Payment pending"}</Badge>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {locked ? "The admin approved your payment and promotion." : promotion.payment.status === "SUBMITTED" ? "Your transaction is waiting for admin verification. You can correct the ID until it is approved." : "Your campaign is saved. You can return and add the payment later."}
                </p>
              </div>
            </CardContent>
          </Card> */}
        </aside>
      </div>
    </main>
  );
}
