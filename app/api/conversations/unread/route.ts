import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const participants = await prisma.conversationParticipant.findMany({
      where: { userId: user.id },
      select: { conversationId: true, lastRead: true },
    });

    let totalUnread = 0;
    for (const participant of participants) {
      const count = await prisma.message.count({
        where: {
          conversationId: participant.conversationId,
          senderId: { not: user.id },
          createdAt: { gt: participant.lastRead },
        },
      });
      totalUnread += count;
    }

    return NextResponse.json({ unreadCount: totalUnread });
  } catch (error) {
    console.error("Get unread count error:", error);
    return NextResponse.json(
      { error: "Failed to fetch unread count" },
      { status: 500 }
    );
  }
}
