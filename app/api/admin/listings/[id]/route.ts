import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface UpdateListingBody {
  status?: "ACTIVE" | "SOLD" | "EXPIRED" | "DELETED";
  featured?: boolean;
}

export async function PUT(
  request: NextApiRequest<UpdateListingBody>,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const listing = await prisma.listing.update({
    where: { id },
    data: {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.featured !== undefined && { featured: body.featured }),
    },
  });

  return NextResponse.json({ listing });
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

  await prisma.listing.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
