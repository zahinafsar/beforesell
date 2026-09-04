import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface UpdateUserBody {
  role?: "USER" | "ADMIN";
  verified?: boolean;
  blocked?: boolean;
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
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      verified: true,
      blocked: true,
      createdAt: true,
      _count: { select: { listings: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PUT(
  request: NextApiRequest<UpdateUserBody>,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  if (body.blocked === true && id === admin.id) {
    return NextResponse.json(
      { error: "You cannot block your own account" },
      { status: 400 }
    );
  }

  const user = await prisma.$transaction(async (transaction) => {
    const updatedUser = await transaction.user.update({
      where: { id },
      data: {
        ...(body.role !== undefined && { role: body.role }),
        ...(body.verified !== undefined && { verified: body.verified }),
        ...(body.blocked !== undefined && { blocked: body.blocked }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verified: true,
        blocked: true,
      },
    });

    if (body.blocked === true) {
      await transaction.listing.updateMany({
        where: {
          userId: id,
          status: { not: "DELETED" },
        },
        data: { status: "DRAFT" },
      });
    }

    return updatedUser;
  });

  return NextResponse.json({ user });
}
