import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createConversationSchema } from "@/lib/validations";
import { sendNewMessageEmail } from "@/lib/email";

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
            slug: true,
            title: true,
            images: { take: 1, orderBy: { order: "asc" } },
          },
        },
        request: { select: { id: true, slug: true, title: true } },
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
          request: conv.request,
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
  listingId?: string;
  requestId?: string;
  content: string;
}

const ownerSelect = { email: true, name: true, lastSeen: true } as const;

async function findConversationSubject(listingId?: string, requestId?: string) {
  if (requestId) {
    const productRequest = await prisma.productRequest.findUnique({
      where: { id: requestId },
      select: { id: true, title: true, userId: true, status: true, user: { select: ownerSelect } },
    });
    if (!productRequest || productRequest.status === "DELETED") {
      return { error: "Request not found", status: 404 };
    }
    if (productRequest.status !== "OPEN") {
      return { error: "This request is no longer open", status: 400 };
    }
    return {
      subject: {
        title: productRequest.title,
        ownerId: productRequest.userId,
        owner: productRequest.user,
        link: { requestId: productRequest.id },
      },
    };
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, title: true, userId: true, status: true, user: { select: ownerSelect } },
  });
  if (!listing) {
    return { error: "Listing not found", status: 404 };
  }
  if (listing.status !== "ACTIVE") {
    return { error: "Cannot message about inactive listing", status: 400 };
  }
  return {
    subject: {
      title: listing.title,
      ownerId: listing.userId,
      owner: listing.user,
      link: { listingId: listing.id },
    },
  };
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

    const { listingId, requestId, content } = validation.data;
    const result = await findConversationSubject(listingId, requestId);

    if (!result.subject) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { subject } = result;

    if (subject.ownerId === user.id) {
      return NextResponse.json(
        { error: "Cannot message yourself" },
        { status: 400 }
      );
    }

    const notifyOwner = async (conversationId: string) => {
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      if (subject.owner.lastSeen >= oneMinuteAgo) {
        return;
      }
      const conversationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/messages?conversation=${conversationId}`;
      try {
        await sendNewMessageEmail(subject.owner.email, user.name, subject.title, conversationUrl);
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
      }
    };

    const existingConversation = await prisma.conversation.findFirst({
      where: {
        ...subject.link,
        AND: [
          { participants: { some: { userId: user.id } } },
          { participants: { some: { userId: subject.ownerId } } },
        ],
      },
    });

    if (existingConversation) {
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

      await notifyOwner(existingConversation.id);

      return NextResponse.json({ conversationId: existingConversation.id });
    }

    const conversation = await prisma.conversation.create({
      data: {
        ...subject.link,
        participants: {
          create: [{ userId: user.id }, { userId: subject.ownerId }],
        },
        messages: {
          create: {
            content,
            senderId: user.id,
          },
        },
      },
    });

    await notifyOwner(conversation.id);

    return NextResponse.json({ conversationId: conversation.id }, { status: 201 });
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
