import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { updateListingSchema } from "@/lib/validations";
import { deleteImages } from "@/lib/cloudinary";

export async function GET(
  request: NextApiRequest<unknown>,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        category: { include: { parent: true } },
        location: true,
        images: { orderBy: { order: "asc" } },
        user: { select: { id: true, name: true, avatar: true, phone: true, createdAt: true } },
        attributeValues: {
          include: {
            attribute: {
              select: { name: true, slug: true, type: true, unit: true },
            },
          },
          orderBy: { attribute: { order: "asc" } },
        },
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

interface UpdateListingBody {
  title?: string;
  description?: string;
  price?: number;
  negotiable?: boolean;
  phone?: string | null;
  status?: "DRAFT" | "ACTIVE" | "SOLD" | "EXPIRED" | "DELETED";
  categoryId?: string;
  locationId?: string;
  attributes?: Record<string, string | string[]>;
}

export async function PUT(
  request: NextApiRequest<UpdateListingBody>,
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

    const attributes = body.attributes as Record<string, string | string[]> | undefined;

    const updateData = { ...validation.data };

    const listing = await prisma.listing.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        location: true,
        images: { orderBy: { order: "asc" } },
      },
    });

    // Update attribute values if provided
    if (attributes !== undefined) {
      const finalCategoryId = (await prisma.listing.findUnique({
        where: { id },
        select: { categoryId: true },
      }))?.categoryId;

      if (finalCategoryId) {
        // Delete existing attribute values
        await prisma.listingAttributeValue.deleteMany({
          where: { listingId: id },
        });

        // Create new attribute values
        if (Object.keys(attributes).length > 0) {
          const categoryAttributes = await prisma.categoryAttribute.findMany({
            where: { categoryId: finalCategoryId },
            select: { id: true, slug: true },
          });

          const slugToId = new Map(categoryAttributes.map((a) => [a.slug, a.id]));
          const attributeData: { listingId: string; attributeId: string; value: string }[] = [];

          for (const [slug, value] of Object.entries(attributes)) {
            const attributeId = slugToId.get(slug);
            if (attributeId && value !== undefined && value !== null && value !== "") {
              const stringValue = Array.isArray(value) ? value.join(",") : String(value);
              attributeData.push({
                listingId: id,
                attributeId,
                value: stringValue,
              });
            }
          }

          if (attributeData.length > 0) {
            await prisma.listingAttributeValue.createMany({ data: attributeData });
          }
        }
      }
    }

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
  request: NextApiRequest<unknown>,
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
