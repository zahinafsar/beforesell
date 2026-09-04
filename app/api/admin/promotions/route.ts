import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface PromotionsQuery {
  page?: string;
  limit?: string;
  status?: string;
}

export async function GET(request: NextApiRequest<unknown, PromotionsQuery>) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const page = Math.max(1, Number(request.nextUrl.searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(request.nextUrl.searchParams.get("limit")) || 20));
  const status = request.nextUrl.searchParams.get("status");
  const where: Prisma.ListingPromotionWhereInput = status
    ? { status: status as Prisma.EnumPromotionStatusFilter["equals"] }
    : {};

  const [promotions, total] = await Promise.all([
    prisma.listingPromotion.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { submittedAt: "desc" },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            images: { select: { url: true }, orderBy: { order: "asc" }, take: 1 },
            category: { select: { name: true } },
          },
        },
        user: { select: { id: true, name: true, email: true } },
        reviewedBy: { select: { name: true } },
      },
    }),
    prisma.listingPromotion.count({ where }),
  ]);

  return NextResponse.json({
    promotions,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
