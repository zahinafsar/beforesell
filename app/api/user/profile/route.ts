import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { uploadImage, deleteImage } from "@/lib/cloudinary";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().optional().nullable(),
});

export async function GET(request: NextApiRequest<unknown>) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        verified: true,
        createdAt: true,
        _count: {
          select: {
            listings: { where: { status: "ACTIVE" } },
          },
        },
      },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Failed to get profile" },
      { status: 500 }
    );
  }
}

interface UpdateProfileBody {
  name?: string;
  phone?: string | null;
}

export async function PUT(request: NextApiRequest<UpdateProfileBody>) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const avatar = formData.get("avatar") as File | null;

      if (!avatar) {
        return NextResponse.json({ error: "No avatar provided" }, { status: 400 });
      }

      const currentUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { avatar: true },
      });

      const result = await uploadImage(avatar, "avatars");

      if (currentUser?.avatar) {
        const publicId = currentUser.avatar.split("/").slice(-2).join("/").split(".")[0];
        if (publicId.startsWith("beforesell")) {
          await deleteImage(publicId).catch(() => {});
        }
      }

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { avatar: result.url },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatar: true,
          verified: true,
        },
      });

      return NextResponse.json({ profile: updated });
    }

    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: validation.data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        verified: true,
      },
    });

    return NextResponse.json({ profile: updated });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
