import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createProductRequestSchema, type CreateProductRequestInput } from "@/lib/validations";
import { generateSlug } from "@/lib/utils";

interface RequestsQuery {
  page?: string;
  limit?: string;
}

export async function GET(request: NextApiRequest<unknown, RequestsQuery>) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(searchParams.get("limit") || "12", 10) || 12));
    const where = { userId: user.id, status: { not: "DELETED" as const } };

    const [requests, total] = await Promise.all([
      prisma.productRequest.findMany({
        where,
        include: {
          category: { select: { name: true } },
          location: { select: { address: true } },
          _count: { select: { conversations: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.productRequest.count({ where }),
    ]);

    return NextResponse.json({
      requests,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get requests error:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

export async function POST(request: NextApiRequest<CreateProductRequestInput>) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validation = createProductRequestSchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { title, description, minBudget, maxBudget, phone, categoryId, locationId } = validation.data;

    const productRequest = await prisma.productRequest.create({
      data: {
        title,
        slug: generateSlug(title),
        description,
        minBudget: minBudget ?? null,
        maxBudget: maxBudget ?? null,
        phone: phone || null,
        categoryId: categoryId || null,
        locationId,
        userId: user.id,
      },
    });

    return NextResponse.json({ request: productRequest }, { status: 201 });
  } catch (error) {
    console.error("Create request error:", error);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}
