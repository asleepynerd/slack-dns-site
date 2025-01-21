import { getServerSession } from "next-auth/next";

export const runtime = "edge";
import { NextResponse } from "next/server";
import { options } from "../../auth/[...nextauth]/options";
import { checkEmailVerification } from "@/lib/cloudflare";

import mongoose from "mongoose";

mongoose.connect(process.env.MONGODB_URI!);

export async function GET(req: Request) {
  const session = await getServerSession(options);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const destinationId = searchParams.get("id");

  if (!destinationId) {
    return NextResponse.json(
      { error: "Destination ID required" },
      { status: 400 }
    );
  }

  try {
    const isVerified = await checkEmailVerification(destinationId);
    return NextResponse.json({ verified: isVerified });
  } catch (error) {
    console.error("Status check failed:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}
