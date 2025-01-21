import { NextResponse } from "next/server";

export const runtime = "edge";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import { Inbox } from "@/lib/models/inbox";
import mongoose from "mongoose";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(options);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const inbox = await Inbox.findOne({
      _id: new mongoose.Types.ObjectId(params.id),
      userId: session.user.id,
    });

    if (!inbox) {
      return NextResponse.json({ error: "Inbox not found" }, { status: 404 });
    }

    await inbox.deleteOne();
    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Delete inbox error:", error);
    return NextResponse.json(
      { error: "Failed to delete inbox" },
      { status: 500 }
    );
  }
}
