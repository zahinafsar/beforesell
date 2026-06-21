import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMessagePush } from "@/lib/fcm";

interface ChatNotifyBody {
  /** Recipient user id. */
  to: string;
  /** Short message preview for the notification body. */
  preview: string;
}

// Wakes the recipient's device for a new chat message. The message content is
// stored in Firebase; this endpoint only delivers the FCM notification.
export async function POST(request: NextApiRequest<ChatNotifyBody>) {
  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: ChatNotifyBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!body.to) {
    return NextResponse.json({ error: "to required" }, { status: 400 });
  }

  const recipient = await prisma.user.findUnique({
    where: { id: body.to },
    select: { fcmToken: true },
  });

  if (recipient?.fcmToken) {
    try {
      await sendMessagePush(recipient.fcmToken, {
        fromId: me.id,
        fromName: me.name,
        preview: body.preview ?? "New message",
      });
    } catch (err) {
      console.error("sendMessagePush failed", err);
    }
  }

  return NextResponse.json({ ok: true });
}
