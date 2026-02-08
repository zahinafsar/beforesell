import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextApiRequest<unknown>) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalUsers,
    newUsers,
    totalListings,
    activeListings,
    totalViews,
    totalConversations,
    listingsByStatus,
    recentListings,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.listing.aggregate({ _sum: { views: true } }),
    prisma.conversation.count(),
    prisma.listing.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.listing.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        category: { select: { name: true } },
        images: { select: { url: true }, take: 1 },
      },
    }),
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verified: true,
        createdAt: true,
        _count: { select: { listings: true } },
      },
    }),
  ]);

  const statusCounts = Object.fromEntries(
    listingsByStatus.map((s) => [s.status, s._count.id])
  );

  return NextResponse.json({
    stats: {
      totalUsers,
      newUsers,
      totalListings,
      activeListings,
      totalViews: totalViews._sum.views ?? 0,
      totalConversations,
      statusCounts,
    },
    recentListings,
    recentUsers,
  });
}
