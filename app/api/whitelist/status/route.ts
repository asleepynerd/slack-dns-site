import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import { Whitelist } from "@/lib/models/whitelist";
import { connectDB } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

export async function GET() {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const whitelist = await Whitelist.findOne({
      userId: session.user.id,
    })
      .select("status requestedAt decidedAt lastRequestAt")
      .lean();

    if (!whitelist) {
      return NextResponse.json({ status: null });
    }

    return NextResponse.json({
      status: whitelist.status,
      requestedAt: whitelist.requestedAt,
      decidedAt: whitelist.decidedAt,
      lastRequestAt: whitelist.lastRequestAt,
    });
  } catch (error) {
    console.error("Whitelist status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch status" },
      { status: 500 }
    );
  }
}
