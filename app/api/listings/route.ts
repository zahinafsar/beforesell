import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
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

interface ListingBody {
  title: string;
  description: string;
  price: number;
  negotiable: boolean;
  categoryId: string;
  locationId: string;
  attributes?: Record<string, string | string[]>;
}

export async function POST(request: NextApiRequest<ListingBody>) {
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

    const { title, description, price, negotiable, categoryId, locationId } = validation.data;
    const attributes = body.attributes as Record<string, string | string[]> | undefined;

    const listing = await prisma.listing.create({
      data: {
        title,
        slug: generateSlug(title),
        description,
        price,
        negotiable,
        categoryId,
        locationId,
        userId: user.id,
        status: "ACTIVE",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      include: {
        category: true,
        location: true,
        images: { orderBy: { order: "asc" } },
      },
    });

    // Save attribute values if provided
    if (attributes && Object.keys(attributes).length > 0) {
      const categoryAttributes = await prisma.categoryAttribute.findMany({
        where: { categoryId },
        select: { id: true, slug: true },
      });

      const slugToId = new Map(categoryAttributes.map((a) => [a.slug, a.id]));
      const attributeData: { listingId: string; attributeId: string; value: string }[] = [];

      for (const [slug, value] of Object.entries(attributes)) {
        const attributeId = slugToId.get(slug);
        if (attributeId && value !== undefined && value !== null && value !== "") {
          const stringValue = Array.isArray(value) ? value.join(",") : String(value);
          attributeData.push({
            listingId: listing.id,
            attributeId,
            value: stringValue,
          });
        }
      }

      if (attributeData.length > 0) {
        await prisma.listingAttributeValue.createMany({ data: attributeData });
      }
    }

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    console.error("Create listing error:", error);
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}

interface ListingsQuery {
  page?: string;
  limit?: string;
  userId?: string;
  categoryId?: string;
  locationId?: string;
  status?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  featured?: string;
}

export async function GET(request: NextApiRequest<unknown, ListingsQuery>) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const userId = searchParams.get("userId") ?? undefined;
    const categoryId = searchParams.get("categoryId") ?? undefined;
    const locationId = searchParams.get("locationId") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const search = searchParams.get("search") ?? undefined;
    const minPrice = searchParams.get("minPrice") ?? undefined;
    const maxPrice = searchParams.get("maxPrice") ?? undefined;
    const sort = searchParams.get("sort") ?? "newest";
    const featured = searchParams.get("featured") ?? undefined;

    const where: Record<string, unknown> = {};
    const andConditions: Record<string, unknown>[] = [];

    if (userId) where.userId = userId;
    if (featured === "true") where.featured = true;

    if (categoryId) {
      andConditions.push({
        OR: [
          { categoryId },
          { category: { parentId: categoryId } },
        ],
      });
    }

    if (locationId) where.locationId = locationId;
    if (status) where.status = status;
    else where.status = "ACTIVE";

    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice);
      if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice);
    }

    // Handle attribute filters (prefixed with "attr_")
    const attrFilters: { slug: string; value?: string; min?: number; max?: number }[] = [];
    searchParams.forEach((value, key) => {
      if (key.startsWith("attr_") && value) {
        const attrSlug = key.slice(5); // Remove "attr_" prefix
        if (attrSlug.endsWith("_min")) {
          const baseSlug = attrSlug.slice(0, -4);
          const existingFilter = attrFilters.find((f) => f.slug === baseSlug);
          if (existingFilter) {
            existingFilter.min = parseFloat(value);
          } else {
            attrFilters.push({ slug: baseSlug, min: parseFloat(value) });
          }
        } else if (attrSlug.endsWith("_max")) {
          const baseSlug = attrSlug.slice(0, -4);
          const existingFilter = attrFilters.find((f) => f.slug === baseSlug);
          if (existingFilter) {
            existingFilter.max = parseFloat(value);
          } else {
            attrFilters.push({ slug: baseSlug, max: parseFloat(value) });
          }
        } else {
          attrFilters.push({ slug: attrSlug, value });
        }
      }
    });

    // Build attribute filter conditions
    if (attrFilters.length > 0) {
      const attrConditions = attrFilters.map((filter) => {
        if (filter.value !== undefined) {
          // Exact match (for SELECT types)
          return {
            attributeValues: {
              some: {
                attribute: { slug: filter.slug },
                value: filter.value,
              },
            },
          };
        } else {
          // Range filter (for NUMBER types)
          const valueConditions: Record<string, unknown>[] = [];
          if (filter.min !== undefined) {
            valueConditions.push({
              attributeValues: {
                some: {
                  attribute: { slug: filter.slug },
                  value: { gte: String(filter.min) },
                },
              },
            });
          }
          if (filter.max !== undefined) {
            valueConditions.push({
              attributeValues: {
                some: {
                  attribute: { slug: filter.slug },
                  value: { lte: String(filter.max) },
                },
              },
            });
          }
          return valueConditions.length > 0 ? { AND: valueConditions } : null;
        }
      }).filter(Boolean);

      if (attrConditions.length > 0) {
        andConditions.push(...(attrConditions as Record<string, unknown>[]));
      }
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
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
          location: true,
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
