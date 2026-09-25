import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { updateProductRequestSchema, type UpdateProductRequestInput } from "@/lib/validations";

export async function GET(
  request: NextApiRequest<unknown>,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const productRequest = await prisma.productRequest.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        location: { select: { id: true, address: true } },
        user: { select: { id: true, name: true, avatar: true, createdAt: true } },
      },
    });

    if (!productRequest || productRequest.status === "DELETED") {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({ request: productRequest });
  } catch (error) {
    console.error("Get request error:", error);
    return NextResponse.json({ error: "Failed to fetch request" }, { status: 500 });
  }
}

export async function PUT(
  request: NextApiRequest<UpdateProductRequestInput>,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.productRequest.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!existing || existing.status === "DELETED") {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
    if (existing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const validation = updateProductRequestSchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const productRequest = await prisma.productRequest.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json({ request: productRequest });
  } catch (error) {
    console.error("Update request error:", error);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextApiRequest<unknown>,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.productRequest.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
    if (existing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.productRequest.update({
      where: { id },
      data: { status: "DELETED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete request error:", error);
    return NextResponse.json({ error: "Failed to delete request" }, { status: 500 });
  }
}
