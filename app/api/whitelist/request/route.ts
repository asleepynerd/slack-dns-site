import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import { Whitelist } from "@/lib/models/whitelist";
import { connectDB } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Check for existing request
    const existingRequest = await Whitelist.findOne({
      userId: session.user.id,
    })
      .select("status lastRequestAt")
      .lean();

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    if (existingRequest?.lastRequestAt > twentyFourHoursAgo) {
      return NextResponse.json(
        { error: "Please wait 24 hours between requests" },
        { status: 429 }
      );
    }

    // Create or update request
    await Whitelist.findOneAndUpdate(
      { userId: session.user.id },
      {
        $set: {
          email: session.user.email,
          status: "pending",
          lastRequestAt: now,
          requestedAt: existingRequest ? existingRequest.requestedAt : now,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Whitelist request error:", error);
    return NextResponse.json(
      { error: "Failed to submit request" },
      { status: 500 }
    );
  }
}
