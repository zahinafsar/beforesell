import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface UpdateCategoryBody {
  name?: string;
  slug?: string;
  icon?: string;
  parentId?: string | null;
}

export async function PUT(
  request: NextApiRequest<UpdateCategoryBody>,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.icon !== undefined && { icon: body.icon }),
      ...(body.parentId !== undefined && { parentId: body.parentId }),
    },
  });

  return NextResponse.json({ category });
}

export async function DELETE(
  request: NextApiRequest<unknown>,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  const listingCount = await prisma.listing.count({
    where: { categoryId: id },
  });
  if (listingCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${listingCount} listings use this category` },
      { status: 400 }
    );
  }

  await prisma.category.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
