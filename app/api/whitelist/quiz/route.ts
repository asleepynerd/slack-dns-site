import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import { Whitelist } from "@/lib/models/whitelist";
import { connectDB } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const whitelist = await Whitelist.findOneAndUpdate(
      {
        userId: session.user.id,
        status: "approved",
      },
      {
        $set: {
          quizCompletedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!whitelist) {
      return NextResponse.json({ error: "Not whitelisted" }, { status: 403 });
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Quiz completion error:", error);
    return NextResponse.json(
      { error: "Failed to save quiz completion" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const whitelist = await Whitelist.findOne({
      userId: session.user.id,
      status: "approved",
    })
      .select("quizCompletedAt")
      .lean();

    return NextResponse.json({
      completed: !!whitelist?.quizCompletedAt,
    });
  } catch (error) {
    console.error("Quiz status check error:", error);
    return NextResponse.json(
      { error: "Failed to check quiz status" },
      { status: 500 }
    );
  }
}
