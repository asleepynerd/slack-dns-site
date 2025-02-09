import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import { connectDB } from "@/lib/db";
import { Feedback } from "@/lib/models/feedback";

export async function POST(req: Request) {
  const session = await getServerSession(options);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { feedback, rating, path } = await req.json();

  if (!feedback || !rating) {
    return NextResponse.json(
      { error: "Feedback and rating are required" },
      { status: 400 }
    );
  }

  if (feedback.length < 20) {
    return NextResponse.json(
      { error: "Feedback must be at least 20 characters long" },
      { status: 400 }
    );
  }

  await connectDB();

  const userFeedback = new Feedback({
    userId: session.user.id,
    feedback,
    rating,
    path,
    userAgent: req.headers.get("user-agent"),
  });

  await userFeedback.save();

  return NextResponse.json({ success: true });
}
