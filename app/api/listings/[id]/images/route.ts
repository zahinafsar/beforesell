import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { uploadImage, deleteImage } from "@/lib/cloudinary";

const MAX_IMAGES = 20;

export async function POST(
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

    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    if (listing.images.length + files.length > MAX_IMAGES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_IMAGES} images allowed` },
        { status: 400 }
      );
    }

    const uploadedImages = [];
    const currentMaxOrder = listing.images.length > 0
      ? Math.max(...listing.images.map((img) => img.order))
      : -1;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await uploadImage(file, "listings");

      const image = await prisma.listingImage.create({
        data: {
          url: result.url,
          publicId: result.publicId,
          order: currentMaxOrder + 1 + i,
          listingId: id,
        },
      });

      uploadedImages.push(image);
    }

    return NextResponse.json({ images: uploadedImages }, { status: 201 });
  } catch (error) {
    console.error("Upload images error:", error);
    return NextResponse.json(
      { error: "Failed to upload images" },
      { status: 500 }
    );
  }
}

interface ReorderImagesBody {
  imageIds: string[];
}

export async function PUT(
  request: NextApiRequest<ReorderImagesBody>,
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
      select: { userId: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { imageIds } = await request.json();

    if (!Array.isArray(imageIds)) {
      return NextResponse.json({ error: "Invalid image order" }, { status: 400 });
    }

    // Update order for each image
    await Promise.all(
      imageIds.map((imageId, index) =>
        prisma.listingImage.update({
          where: { id: imageId },
          data: { order: index },
        })
      )
    );

    const images = await prisma.listingImage.findMany({
      where: { listingId: id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Reorder images error:", error);
    return NextResponse.json(
      { error: "Failed to reorder images" },
      { status: 500 }
    );
  }
}

interface DeleteImageQuery {
  imageId?: string;
}

export async function DELETE(
  request: NextApiRequest<unknown, DeleteImageQuery>,
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
      select: { userId: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const imageId = request.nextUrl.searchParams.get("imageId");

    if (!imageId) {
      return NextResponse.json({ error: "Image ID required" }, { status: 400 });
    }

    const image = await prisma.listingImage.findUnique({
      where: { id: imageId },
    });

    if (!image || image.listingId !== id) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Delete from Cloudinary
    await deleteImage(image.publicId);

    // Delete from database
    await prisma.listingImage.delete({ where: { id: imageId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete image error:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
