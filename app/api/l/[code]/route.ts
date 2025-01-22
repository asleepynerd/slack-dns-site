import { NextResponse } from "next/server";
import { Link } from "@/lib/models/link";
import { connectDB } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    await connectDB();

    const link = await Link.findOneAndUpdate(
      { shortCode: params.code },
      {
        $inc: { clicks: 1 },
        $set: { lastClickedAt: new Date() },
      },
      { new: true }
    );

    if (!link) {
      return new Response("Link not found", { status: 404 });
    }

    return NextResponse.redirect(link.destination);
  } catch (error) {
    console.error("Link redirect error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
