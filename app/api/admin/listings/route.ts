import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface ListingsQuery {
  page?: string;
  limit?: string;
  status?: string;
  categoryId?: string;
  search?: string;
  userId?: string;
}

export async function GET(request: NextApiRequest<unknown, ListingsQuery>) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const status = searchParams.get("status");
  const categoryId = searchParams.get("categoryId");
  const search = searchParams.get("search");
  const userId = searchParams.get("userId");

  const where: Prisma.ListingWhereInput = {};
  if (status) where.status = status as Prisma.EnumListingStatusFilter["equals"];
  if (categoryId) where.categoryId = categoryId;
  if (userId) where.userId = userId;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        category: { select: { name: true } },
        location: { select: { address: true } },
        images: { select: { url: true }, take: 1 },
      },
    }),
    prisma.listing.count({ where }),
  ]);

  return NextResponse.json({
    listings,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
