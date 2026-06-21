import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendCallPush } from "@/lib/fcm";

interface NotifyBody {
  /** Recipient user id. */
  to: string;
  /** RTC channel for this call. */
  channel: string;
  /**
   * "invite" rings the callee; "cancel" dismisses a pending ring on the callee;
   * "decline" tells the caller the callee rejected (used when the callee
   * declines from the notification with no live RTM connection).
   */
  type: "invite" | "cancel" | "decline";
}

const TYPE_MAP = {
  invite: "incoming_call",
  cancel: "call_cancelled",
  decline: "call_declined",
} as const;

// Wakes an offline callee via FCM so the incoming call rings even when their app
// is killed. The live RTM `invite` handles the online case; this is the offline
// fallback fired alongside it by the caller.
export async function POST(request: NextApiRequest<NotifyBody>) {
  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: NotifyBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { to, channel, type } = body;
  if (!to || !channel) {
    return NextResponse.json({ error: "to and channel required" }, { status: 400 });
  }

  const callee = await prisma.user.findUnique({
    where: { id: to },
    select: { fcmToken: true },
  });

  if (callee?.fcmToken) {
    try {
      await sendCallPush(callee.fcmToken, {
        type: TYPE_MAP[type] ?? "incoming_call",
        channel,
        callerId: me.id,
        callerName: me.name,
      });
    } catch (err) {
      console.error("sendCallPush failed", err);
    }
  }

  return NextResponse.json({ ok: true });
}
