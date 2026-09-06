import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  submitPromotionPaymentSchema,
  type SubmitPromotionPaymentInput,
} from "@/lib/validations";
import { sendPromotionReviewEmail } from "@/lib/email";

export async function PUT(
  request: NextApiRequest<SubmitPromotionPaymentInput>,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = submitPromotionPaymentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid transaction ID" },
      { status: 400 },
    );
  }

  const { id } = await params;
  const promotion = await prisma.listingPromotion.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      status: true,
      totalBudget: true,
      durationDays: true,
      listing: { select: { title: true } },
      payment: { select: { id: true, status: true } },
    },
  });

  if (!promotion || promotion.userId !== user.id || !promotion.payment) {
    return NextResponse.json({ error: "Payment request not found" }, { status: 404 });
  }
  if (promotion.status === "APPROVED" || promotion.payment.status === "APPROVED") {
    return NextResponse.json({ error: "Approved payments cannot be edited" }, { status: 409 });
  }
  if (promotion.status === "REJECTED") {
    return NextResponse.json({ error: "Rejected promotions cannot accept payment updates" }, { status: 409 });
  }

  try {
    const payment = await prisma.promotionPayment.update({
      where: { id: promotion.payment.id },
      data: {
        transactionId: parsed.data.transactionId.toUpperCase(),
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });

    let emailSent = true;
    try {
      await sendPromotionReviewEmail({
        promotionId: promotion.id,
        listingTitle: promotion.listing.title,
        ownerName: user.name,
        totalBudget: promotion.totalBudget,
        durationDays: promotion.durationDays,
      });
    } catch (error) {
      emailSent = false;
      console.error("Failed to send promotion payment review email", error);
    }

    return NextResponse.json({ payment, emailSent });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "This transaction ID has already been submitted" },
        { status: 409 },
      );
    }
    throw error;
  }
}
