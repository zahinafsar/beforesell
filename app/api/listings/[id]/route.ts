import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { updateListingSchema } from "@/lib/validations";
import { deleteImages } from "@/lib/cloudinary";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        category: { include: { parent: true } },
        district: { include: { division: true } },
        images: { orderBy: { order: "asc" } },
        user: { select: { id: true, name: true, avatar: true, phone: true, createdAt: true } },
        _count: { select: { favorites: true } },
      },
    });

    if (!listing || listing.status === "DELETED") {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Increment view count
    await prisma.listing.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ listing: { ...listing, views: listing.views + 1 } });
  } catch (error) {
    console.error("Get listing error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingListing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (existingListing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = updateListingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.update({
      where: { id },
      data: validation.data,
      include: {
        category: true,
        district: { include: { division: true } },
        images: { orderBy: { order: "asc" } },
      },
    });

    return NextResponse.json({ listing });
  } catch (error) {
    console.error("Update listing error:", error);
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete images from Cloudinary
    if (listing.images.length > 0) {
      await deleteImages(listing.images.map((img) => img.publicId));
    }

    // Soft delete
    await prisma.listing.update({
      where: { id },
      data: { status: "DELETED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete listing error:", error);
    return NextResponse.json(
      { error: "Failed to delete listing" },
      { status: 500 }
    );
  }
}
