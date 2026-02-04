import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const attributes = await prisma.categoryAttribute.findMany({
      where: { categoryId: id },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        options: true,
        unit: true,
        required: true,
        filterable: true,
        order: true,
      },
    });

    return NextResponse.json({ attributes });
  } catch (error) {
    console.error("Get category attributes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch category attributes" },
      { status: 500 }
    );
  }
}
