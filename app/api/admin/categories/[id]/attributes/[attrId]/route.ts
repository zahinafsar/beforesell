import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface UpdateAttributeBody {
  name?: string;
  slug?: string;
  type?: "SELECT" | "MULTI_SELECT" | "TEXT" | "NUMBER" | "BOOLEAN";
  options?: string[];
  unit?: string;
  required?: boolean;
  filterable?: boolean;
}

export async function PUT(
  request: NextApiRequest<UpdateAttributeBody>,
  { params }: { params: Promise<{ id: string; attrId: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { attrId } = await params;
  const body = await request.json();

  const attribute = await prisma.categoryAttribute.update({
    where: { id: attrId },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.type !== undefined && { type: body.type }),
      ...(body.options !== undefined && { options: body.options }),
      ...(body.unit !== undefined && { unit: body.unit }),
      ...(body.required !== undefined && { required: body.required }),
      ...(body.filterable !== undefined && { filterable: body.filterable }),
    },
  });

  return NextResponse.json({ attribute });
}

export async function DELETE(
  request: NextApiRequest<unknown>,
  { params }: { params: Promise<{ id: string; attrId: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { attrId } = await params;

  await prisma.categoryAttribute.delete({ where: { id: attrId } });

  return NextResponse.json({ success: true });
}
