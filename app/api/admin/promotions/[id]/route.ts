import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPromotionStatusEmail } from "@/lib/email";

const updatePromotionSchema = z.object({
  status: z.enum(["PENDING_REVIEW", "PROCESSING", "APPROVED", "REJECTED"]),
  reviewNote: z.string().max(500).optional(),
});

type UpdatePromotionBody = z.infer<typeof updatePromotionSchema>;

export async function PUT(
  request: NextApiRequest<UpdatePromotionBody>,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const parsed = updatePromotionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid review update" },
      { status: 400 },
    );
  }

  const { id } = await params;
  const existing = await prisma.listingPromotion.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      user: { select: { email: true, name: true } },
      listing: { select: { title: true, slug: true } },
    },
  });
  if (!existing) {
    return NextResponse.json({ error: "Promotion not found" }, { status: 404 });
  }

  const promotion = await prisma.listingPromotion.update({
    where: { id },
    data: {
      status: parsed.data.status,
      reviewNote: parsed.data.reviewNote?.trim() || null,
      reviewedAt: new Date(),
      reviewedById: admin.id,
    },
  });

  if (existing.status !== promotion.status) {
    try {
      await sendPromotionStatusEmail({
        email: existing.user.email,
        ownerName: existing.user.name,
        listingTitle: existing.listing.title,
        listingSlug: existing.listing.slug,
        status: promotion.status,
        reviewNote: promotion.reviewNote,
      });
    } catch (error) {
      console.error("Failed to send promotion status email", error);
    }
  }

  return NextResponse.json({ promotion });
}
