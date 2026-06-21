import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { RtcTokenBuilder, RtcRole, RtmTokenBuilder } from "agora-token";
import { getCurrentUser } from "@/lib/auth";

const APP_ID = process.env.AGORA_APP_ID ?? "";
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE ?? "";
const EXPIRE_SECONDS = 60 * 60; // 1 hour

interface TokenBody {
  /** RTC channel to join. When omitted, only an RTM token is returned (for sign-in). */
  channel?: string;
}

// Issues Agora RTM (signaling) + RTC (media) tokens for the authenticated user.
// RTM account = our user id; RTC uses uid 0 so Agora assigns the in-call uid.
export async function POST(request: NextApiRequest<TokenBody>) {
  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!APP_ID || !APP_CERTIFICATE) {
    return NextResponse.json(
      { error: "Agora is not configured on the server" },
      { status: 500 }
    );
  }

  let channel: string | undefined;
  try {
    ({ channel } = await request.json());
  } catch {
    // No body — RTM-token-only request.
  }

  const rtmToken = RtmTokenBuilder.buildToken(
    APP_ID,
    APP_CERTIFICATE,
    me.id,
    EXPIRE_SECONDS
  );

  const rtcToken = channel
    ? RtcTokenBuilder.buildTokenWithUid(
        APP_ID,
        APP_CERTIFICATE,
        channel,
        0,
        RtcRole.PUBLISHER,
        EXPIRE_SECONDS,
        EXPIRE_SECONDS
      )
    : null;

  return NextResponse.json({
    appId: APP_ID,
    uid: 0,
    channel: channel ?? null,
    rtcToken,
    rtmToken,
  });
}
