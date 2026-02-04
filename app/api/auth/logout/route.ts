import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { removeAuthCookie } from "@/lib/auth";

export async function POST(request: NextApiRequest<unknown>) {
  await removeAuthCookie();
  return NextResponse.json({ success: true });
}
