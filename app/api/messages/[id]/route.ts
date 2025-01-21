import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import { Message, Inbox } from "@/lib/models/inbox";
import mongoose from "mongoose";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await req.json();
    const messageId = params.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const inbox = await Inbox.findOne({
      _id: message.inboxId,
      userId: session.user.id,
    });
    if (!inbox) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    switch (action) {
      case "delete":
        message.deleted = true;
        message.deletedAt = new Date();
        break;
      case "restore":
        message.deleted = false;
        message.deletedAt = undefined;
        break;
      case "permanent-delete":
        await message.deleteOne();
        return NextResponse.json({ status: "success" });
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await message.save();
    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Message action error:", error);
    return NextResponse.json(
      { error: "Failed to perform action" },
      { status: 500 }
    );
  }
}
