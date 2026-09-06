import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPromotionSchema, type CreatePromotionInput } from "@/lib/validations";
import { BKASH_PAYMENT_NUMBER } from "@/lib/promotion-payment";

export async function POST(
  request: NextApiRequest<CreatePromotionInput>,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: listingId } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      userId: true,
      status: true,
      promotions: {
        where: { status: { in: ["PENDING_REVIEW", "PROCESSING", "APPROVED"] } },
        select: { id: true, status: true },
        take: 1,
      },
    },
  });

  if (!listing || listing.status === "DELETED") {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  if (listing.userId !== user.id) {
    return NextResponse.json({ error: "You can only boost your own listing" }, { status: 403 });
  }
  if (listing.status !== "ACTIVE") {
    return NextResponse.json({ error: "Only active listings can be boosted" }, { status: 400 });
  }
  if (listing.promotions.length > 0) {
    return NextResponse.json(
      { error: "This listing already has an active promotion request" },
      { status: 409 },
    );
  }

  const parsed = createPromotionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid promotion details" },
      { status: 400 },
    );
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const startDate = new Date(`${parsed.data.startDate}T00:00:00.000Z`);
  if (startDate < today) {
    return NextResponse.json({ error: "Start date cannot be in the past" }, { status: 400 });
  }

  const totalBudget = parsed.data.dailyBudget * parsed.data.durationDays;
  const promotion = await prisma.listingPromotion.create({
    data: {
      listingId,
      userId: user.id,
      audienceType: parsed.data.audienceType,
      location: parsed.data.location,
      minAge: parsed.data.minAge,
      maxAge: parsed.data.maxAge,
      startDate,
      durationDays: parsed.data.durationDays,
      dailyBudget: parsed.data.dailyBudget,
      totalBudget,
      gender: parsed.data.gender,
      estimatedMinReach: Math.round(parsed.data.dailyBudget * 6.5),
      estimatedMaxReach: Math.round(parsed.data.dailyBudget * 20),
      payment: {
        create: {
          recipientNumber: BKASH_PAYMENT_NUMBER,
          amount: totalBudget,
        },
      },
    },
    include: { payment: true },
  });

  return NextResponse.json({ promotion }, { status: 201 });
}
