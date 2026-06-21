import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface PushTokenBody {
  /** FCM device token, or null to clear it on logout. */
  token: string | null;
}

// Stores (or clears) the caller's FCM device token so the server can wake the
// device for incoming calls while the app is killed.
export async function POST(request: NextApiRequest<PushTokenBody>) {
  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let token: string | null = null;
  try {
    ({ token } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: me.id },
    data: { fcmToken: token ?? null },
  });

  return NextResponse.json({ ok: true });
}
