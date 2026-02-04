import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createListingSchema } from "@/lib/validations";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    + "-" + Date.now().toString(36);
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createListingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { title, description, price, negotiable, condition, categoryId, districtId } = validation.data;

    const listing = await prisma.listing.create({
      data: {
        title,
        slug: generateSlug(title),
        description,
        price,
        negotiable,
        condition,
        categoryId,
        districtId,
        userId: user.id,
        status: "ACTIVE",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      include: {
        category: true,
        district: { include: { division: true } },
        images: { orderBy: { order: "asc" } },
      },
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    console.error("Create listing error:", error);
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const userId = searchParams.get("userId");
    const categoryId = searchParams.get("categoryId");
    const districtId = searchParams.get("districtId");
    const divisionId = searchParams.get("divisionId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const condition = searchParams.get("condition");
    const sort = searchParams.get("sort") || "newest";
    const featured = searchParams.get("featured");

    const where: Record<string, unknown> = {};

    if (userId) where.userId = userId;
    if (featured === "true") where.featured = true;
    if (categoryId) {
      where.OR = [
        { categoryId },
        { category: { parentId: categoryId } },
      ];
    }
    if (districtId) where.districtId = districtId;
    if (divisionId) where.district = { divisionId };
    if (status) where.status = status;
    else where.status = "ACTIVE";

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice);
      if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice);
    }

    if (condition) {
      const conditions = condition.split(",");
      if (conditions.length === 1) {
        where.condition = condition;
      } else {
        where.condition = { in: conditions };
      }
    }

    let orderBy: Record<string, string> = { createdAt: "desc" };
    switch (sort) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "popular":
        orderBy = { views: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          category: true,
          district: { include: { division: true } },
          images: { orderBy: { order: "asc" }, take: 1 },
          user: { select: { id: true, name: true, avatar: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ]);

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get listings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
