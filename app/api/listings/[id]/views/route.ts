import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { trackListingViewSchema, type TrackListingViewInput } from "@/lib/validations";

const deviceCookie = "beforesell-device-id";

function sourceFromAttribution(
  utmSource: string | null,
  referrer: string | null,
  landingUrl: string,
  gclid: string | null,
  fbclid: string | null,
) {
  if (gclid) return "Google";
  if (fbclid) return "Facebook";
  const value = utmSource?.toLowerCase() ?? "";
  if (value.includes("google")) return "Google";
  if (value.includes("facebook") || value === "fb" || value.includes("meta")) return "Facebook";
  if (value.includes("instagram")) return "Instagram";
  if (value.includes("bing")) return "Bing";
  if (value) return value.replace(/(^|[-_\s])\w/g, (character) => character.toUpperCase());
  if (!referrer) return "Direct";

  try {
    const hostname = new URL(referrer).hostname.toLowerCase();
    if (hostname === new URL(landingUrl).hostname.toLowerCase()) return "Internal";
    if (hostname.includes("google.")) return "Google";
    if (hostname.includes("facebook.") || hostname.includes("fb.com")) return "Facebook";
    if (hostname.includes("instagram.")) return "Instagram";
    if (hostname.includes("bing.")) return "Bing";
    return "Other";
  } catch {
    return "Other";
  }
}

function deviceFromUserAgent(userAgent: string) {
  if (/ipad|tablet|kindle/i.test(userAgent)) return "Tablet";
  if (/mobile|iphone|android/i.test(userAgent)) return "Mobile";
  return "Desktop";
}

function browserFromUserAgent(userAgent: string) {
  if (/edg\//i.test(userAgent)) return "Edge";
  if (/firefox|fxios/i.test(userAgent)) return "Firefox";
  if (/chrome|crios/i.test(userAgent)) return "Chrome";
  if (/safari/i.test(userAgent)) return "Safari";
  return "Other";
}

function operatingSystemFromUserAgent(userAgent: string) {
  if (/windows/i.test(userAgent)) return "Windows";
  if (/iphone|ipad|ios/i.test(userAgent)) return "iOS";
  if (/android/i.test(userAgent)) return "Android";
  if (/mac os|macintosh/i.test(userAgent)) return "macOS";
  if (/linux/i.test(userAgent)) return "Linux";
  return "Other";
}

function isAutomatedTraffic(userAgent: string) {
  return /bot|crawler|spider|slurp|headless|preview|facebookexternalhit|whatsapp/i.test(userAgent);
}

export async function POST(
  request: NextApiRequest<TrackListingViewInput>,
  { params }: { params: Promise<{ id: string }> },
) {
  const parsed = trackListingViewSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid analytics event" }, { status: 400 });
  }

  const { id: listingId } = await params;
  const [user, listing] = await Promise.all([
    getCurrentUser(),
    prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, userId: true, status: true },
    }),
  ]);

  if (!listing || listing.status === "DELETED") {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  if (user?.id === listing.userId) {
    return NextResponse.json({ tracked: false, reason: "owner" });
  }

  const cookieDeviceId = request.cookies.get(deviceCookie)?.value;
  const deviceId = cookieDeviceId && /^[a-f0-9-]{36}$/i.test(cookieDeviceId)
    ? cookieDeviceId
    : crypto.randomUUID();
  const userAgent = request.headers.get("user-agent") ?? "";
  if (!userAgent || isAutomatedTraffic(userAgent)) {
    return NextResponse.json({ tracked: false, reason: "automated" });
  }

  try {
    await prisma.listingViewEvent.create({
      data: {
        visitId: parsed.data.visitId,
        listingId,
        viewerUserId: user?.id ?? null,
        deviceId,
        viewerKey: user ? `user:${user.id}` : `device:${deviceId}`,
        source: sourceFromAttribution(
          parsed.data.utmSource,
          parsed.data.referrer,
          parsed.data.landingUrl,
          parsed.data.gclid,
          parsed.data.fbclid,
        ),
        referrer: parsed.data.referrer,
        landingUrl: parsed.data.landingUrl,
        utmSource: parsed.data.utmSource,
        utmMedium: parsed.data.utmMedium,
        utmCampaign: parsed.data.utmCampaign,
        utmTerm: parsed.data.utmTerm,
        utmContent: parsed.data.utmContent,
        gclid: parsed.data.gclid,
        fbclid: parsed.data.fbclid,
        deviceType: deviceFromUserAgent(userAgent),
        browser: browserFromUserAgent(userAgent),
        operatingSystem: operatingSystemFromUserAgent(userAgent),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ tracked: false, reason: "duplicate" });
    }
    throw error;
  }

  const response = NextResponse.json({ tracked: true });
  if (!cookieDeviceId) {
    response.cookies.set(deviceCookie, deviceId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }
  return response;
}
