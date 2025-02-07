import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import { connectDB } from "@/lib/db";
import { Feedback } from "@/lib/models/feedback";

export async function GET() {
  const session = await getServerSession(options);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const feedback = await Feedback.findOne({ userId: session.user.id });
  
  if (!feedback) {
    return NextResponse.json(null);
  }

  return NextResponse.json(feedback);
} 