import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    select: { id: true },
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

  return NextResponse.json({ promotion });
}
