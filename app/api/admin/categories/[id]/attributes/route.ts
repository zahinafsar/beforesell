import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface CreateAttributeBody {
  name: string;
  slug: string;
  type: "SELECT" | "MULTI_SELECT" | "TEXT" | "NUMBER" | "BOOLEAN";
  options?: string[];
  unit?: string;
  required?: boolean;
  filterable?: boolean;
}

export async function GET(
  request: NextApiRequest<unknown>,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const attributes = await prisma.categoryAttribute.findMany({
    where: { categoryId: id },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ attributes });
}

export async function POST(
  request: NextApiRequest<CreateAttributeBody>,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  if (!body.name || !body.slug || !body.type) {
    return NextResponse.json(
      { error: "Name, slug, and type are required" },
      { status: 400 }
    );
  }

  const maxOrder = await prisma.categoryAttribute.findFirst({
    where: { categoryId: id },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const attribute = await prisma.categoryAttribute.create({
    data: {
      name: body.name,
      slug: body.slug,
      type: body.type,
      options: body.options ?? [],
      unit: body.unit,
      required: body.required ?? false,
      filterable: body.filterable ?? true,
      order: (maxOrder?.order ?? -1) + 1,
      categoryId: id,
    },
  });

  return NextResponse.json({ attribute }, { status: 201 });
}
