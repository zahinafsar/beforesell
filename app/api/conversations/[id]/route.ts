import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const after = searchParams.get("after");

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        participants: { some: { userId: user.id } },
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            images: { take: 1, orderBy: { order: "asc" } },
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                lastSeen: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: id,
        ...(after ? { createdAt: { gt: new Date(after) } } : {}),
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Update lastRead for current user
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: { conversationId: id, userId: user.id },
      },
      data: { lastRead: new Date() },
    });

    const otherUser = conversation.participants.find((p) => p.userId !== user.id)?.user;

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        listing: conversation.listing,
        otherUser,
      },
      messages,
    });
  } catch (error) {
    console.error("Get conversation error:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}
