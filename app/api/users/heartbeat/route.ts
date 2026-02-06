import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextApiRequest<{ offline?: boolean }>) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { offline?: boolean } = {};
    try {
      body = await request.json();
    } catch {
      // No body or invalid JSON — treat as online heartbeat
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastSeen: body.offline
          ? new Date(Date.now() - 10 * 60 * 1000) // 10min ago = instant offline
          : new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Heartbeat error:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
