import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface UpdateUserBody {
  role?: "USER" | "ADMIN";
  verified?: boolean;
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

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(body.role !== undefined && { role: body.role }),
      ...(body.verified !== undefined && { verified: body.verified }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      verified: true,
    },
  });

  return NextResponse.json({ user });
}
