import { NextResponse } from "next/server";
import { Whitelist } from "@/lib/models/whitelist";
import { connectDB } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { userId, status, decidedBy } = data;

    if (!userId || !status || !decidedBy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    await Whitelist.findOneAndUpdate(
      { userId },
      {
        $set: {
          status,
          decidedBy,
          decidedAt: new Date(),
        },
      },
      { new: true }
    ).lean();

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Whitelist webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
