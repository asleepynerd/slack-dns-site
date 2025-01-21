import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import { Whitelist } from "@/lib/models/whitelist";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const request = await Whitelist.findOne({ userId: session.user.id });
    if (!request) {
      return NextResponse.json({ status: null });
    }

    return NextResponse.json({
      status: request.status,
      requestedAt: request.requestedAt,
      decidedAt: request.decidedAt,
      lastRequestAt: request.lastRequestAt,
    });
  } catch (error) {
    console.error("Status fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch status" },
      { status: 500 }
    );
  }
}
