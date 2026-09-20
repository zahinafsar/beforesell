import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { deleteVideo, uploadVideo } from "@/lib/cloudinary";

const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"]);

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
      select: {
        userId: true,
        videoUrl: true,
        videoPublicId: true,
        _count: { select: { images: true } },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const action = formData.get("action");

    if (action === "delete") {
      await prisma.listing.update({
        where: { id },
        data: { videoUrl: null, videoPublicId: null },
      });

      if (listing.videoPublicId) {
        try {
          await deleteVideo(listing.videoPublicId);
        } catch (error) {
          console.error("Delete listing video asset error:", error);
        }
      }

      return NextResponse.json({ success: true });
    }

    if (listing._count.images === 0) {
      return NextResponse.json(
        { error: "Add a cover photo before uploading a video" },
        { status: 400 }
      );
    }

    const video = formData.get("video");
    if (!(video instanceof File)) {
      return NextResponse.json({ error: "No video provided" }, { status: 400 });
    }

    if (!VIDEO_TYPES.has(video.type)) {
      return NextResponse.json(
        { error: "Video must be an MP4, WebM, MOV, or M4V file" },
        { status: 400 }
      );
    }

    if (video.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: "Video must be 100 MB or smaller" },
        { status: 400 }
      );
    }

    const uploadedVideo = await uploadVideo(video, "listing-videos");

    try {
      await prisma.listing.update({
        where: { id },
        data: {
          videoUrl: uploadedVideo.url,
          videoPublicId: uploadedVideo.publicId,
        },
      });
    } catch (error) {
      await deleteVideo(uploadedVideo.publicId);
      throw error;
    }

    if (listing.videoPublicId) {
      try {
        await deleteVideo(listing.videoPublicId);
      } catch (error) {
        console.error("Delete replaced video error:", error);
      }
    }

    return NextResponse.json({ video: uploadedVideo }, { status: 201 });
  } catch (error) {
    console.error("Update listing video error:", error);
    return NextResponse.json(
      { error: "Failed to update video" },
      { status: 500 }
    );
  }
}
