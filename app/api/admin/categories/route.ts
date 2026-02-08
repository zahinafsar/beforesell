import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface CreateCategoryBody {
  name: string;
  slug: string;
  icon?: string;
  parentId?: string;
}

export async function GET(request: NextApiRequest<unknown>) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { children: true, listings: true, attributes: true } },
      children: {
        orderBy: { name: "asc" },
        include: {
          _count: { select: { children: true, listings: true, attributes: true } },
        },
      },
    },
    where: { parentId: null },
  });

  return NextResponse.json({ categories });
}

export async function POST(request: NextApiRequest<CreateCategoryBody>) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();

  if (!body.name || !body.slug) {
    return NextResponse.json(
      { error: "Name and slug are required" },
      { status: 400 }
    );
  }

  const existing = await prisma.category.findFirst({
    where: { OR: [{ name: body.name }, { slug: body.slug }] },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Category with this name or slug already exists" },
      { status: 400 }
    );
  }

  const category = await prisma.category.create({
    data: {
      name: body.name,
      slug: body.slug,
      icon: body.icon,
      parentId: body.parentId || null,
    },
  });

  return NextResponse.json({ category }, { status: 201 });
}
