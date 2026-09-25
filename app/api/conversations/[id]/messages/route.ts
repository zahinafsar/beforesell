import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendMessageSchema } from "@/lib/validations";
import { sendMessageEmailNotification } from "@/lib/message-email-notification";

interface SendMessageBody {
  content: string;
}

export async function POST(
  request: NextApiRequest<SendMessageBody>,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = sendMessageSchema.safeParse({ ...body, conversationId: id });

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { content } = validation.data;

    // Verify user is participant
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        participants: { some: { userId: user.id } },
      },
      include: {
        listing: { select: { title: true } },
        request: { select: { title: true } },
        participants: {
          include: {
            user: { select: { id: true, email: true, name: true, lastSeen: true } },
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          content,
          conversationId: id,
          senderId: user.id,
        },
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.conversation.update({
        where: { id },
        data: { updatedAt: new Date() },
      }),
      prisma.conversationParticipant.update({
        where: { conversationId_userId: { conversationId: id, userId: user.id } },
        data: { lastRead: new Date() },
      }),
    ]);

    const recipient = conversation.participants.find((p) => p.userId !== user.id)?.user;
    if (recipient) {
      try {
        await sendMessageEmailNotification({
          senderId: user.id,
          senderName: user.name,
          recipientId: recipient.id,
          recipientEmail: recipient.email,
          recipientLastSeen: recipient.lastSeen,
          subjectTitle:
            conversation.request?.title ??
            conversation.listing?.title ??
            "your conversation",
          conversationId: id,
        });
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
      }
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
