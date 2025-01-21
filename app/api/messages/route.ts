import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import { Message, Inbox } from "@/lib/models/inbox";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const inboxId = searchParams.get("inboxId");
    const folder = searchParams.get("folder") || "inbox";

    if (!inboxId) {
      return NextResponse.json({ error: "Inbox ID required" }, { status: 400 });
    }

    const inbox = await Inbox.findOne({
      _id: new mongoose.Types.ObjectId(inboxId),
      userId: session.user.id,
    });

    if (!inbox) {
      console.error("Inbox not found:", inboxId);
      return NextResponse.json({ error: "Inbox not found" }, { status: 404 });
    }

    const allInboxMessages = await Message.find({
      inboxId: inbox._id.toString(),
    }).lean();

    let query: any = { inboxId: inbox._id.toString() };

    switch (folder) {
      case "sent":
        query.sent = true;
        query.deleted = { $ne: true };
        break;
      case "junk":
        query.junk = true;
        query.deleted = { $ne: true };
        break;
      case "deleted":
        query.deleted = true;
        break;
      default:
        query = {
          inboxId: inbox._id.toString(),
          sent: false,
          junk: { $ne: true },
          deleted: { $ne: true },
        };
    }

    const messages = await Message.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Messages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
