import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface UsersQuery {
  search?: string;
  cursor?: string;
  limit?: string;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

// Authenticated user directory, cursor-paginated so it scales regardless of
// total user count. Order by id (stable, indexed) for consistent paging.
export async function GET(request: NextApiRequest<unknown, UsersQuery>) {
  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sp = request.nextUrl.searchParams;
  const search = sp.get("search")?.trim() ?? "";
  const cursor = sp.get("cursor") ?? undefined;
  const limit = Math.min(Number(sp.get("limit")) || DEFAULT_LIMIT, MAX_LIMIT);

  const rows = await prisma.user.findMany({
    where: {
      id: { not: me.id },
      ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
    },
    orderBy: { id: "asc" },
    take: limit + 1, // fetch one extra to detect another page
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: { id: true, name: true, avatar: true },
  });

  const hasMore = rows.length > limit;
  const users = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? users[users.length - 1].id : null;

  return NextResponse.json({ users, nextCursor });
}
