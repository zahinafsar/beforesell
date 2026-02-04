import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createConversationSchema } from "@/lib/validations";

export async function GET(request: NextApiRequest<unknown>) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: { some: { userId: user.id } },
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
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
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const participant = conv.participants.find((p) => p.userId === user.id);
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: user.id },
            createdAt: { gt: participant?.lastRead || new Date(0) },
          },
        });
        const otherParticipant = conv.participants.find((p) => p.userId !== user.id);
        return {
          id: conv.id,
          listing: conv.listing,
          otherUser: otherParticipant?.user,
          lastMessage: conv.messages[0] || null,
          unreadCount,
          updatedAt: conv.updatedAt,
        };
      })
    );

    return NextResponse.json({ conversations: conversationsWithUnread });
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

interface CreateConversationBody {
  listingId: string;
  content: string;
}

export async function POST(request: NextApiRequest<CreateConversationBody>) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createConversationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { listingId, content } = validation.data;

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, userId: true, status: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Cannot message about inactive listing" },
        { status: 400 }
      );
    }

    if (listing.userId === user.id) {
      return NextResponse.json(
        { error: "Cannot message yourself" },
        { status: 400 }
      );
    }

    // Check for existing conversation
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        listingId,
        AND: [
          { participants: { some: { userId: user.id } } },
          { participants: { some: { userId: listing.userId } } },
        ],
      },
    });

    if (existingConversation) {
      // Add message to existing conversation
      await prisma.$transaction([
        prisma.message.create({
          data: {
            content,
            conversationId: existingConversation.id,
            senderId: user.id,
          },
        }),
        prisma.conversation.update({
          where: { id: existingConversation.id },
          data: { updatedAt: new Date() },
        }),
        prisma.conversationParticipant.update({
          where: {
            conversationId_userId: {
              conversationId: existingConversation.id,
              userId: user.id,
            },
          },
          data: { lastRead: new Date() },
        }),
      ]);

      return NextResponse.json({ conversationId: existingConversation.id });
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        listingId,
        participants: {
          create: [{ userId: user.id }, { userId: listing.userId }],
        },
        messages: {
          create: {
            content,
            senderId: user.id,
          },
        },
      },
    });

    return NextResponse.json({ conversationId: conversation.id }, { status: 201 });
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
