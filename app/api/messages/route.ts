import { NextResponse } from "next/server";
import { Message, Inbox } from "@/lib/models/inbox";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const maxDuration = 5;

export async function GET(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const inboxId = url.searchParams.get("inboxId");
    const folder = url.searchParams.get("folder") || "inbox";

    console.log("Debug - Request params:", { inboxId, folder });

    if (!inboxId) {
      return NextResponse.json({ error: "Missing inboxId" }, { status: 400 });
    }

    await connectDB();

    const inbox = await Inbox.findOne({
      _id: new mongoose.Types.ObjectId(inboxId),
      userId: session.user.id,
    });

    if (!inbox) {
      console.error("Inbox not found or unauthorized:", inboxId);
      return NextResponse.json({ error: "Inbox not found" }, { status: 404 });
    }

    let query: any = { inboxId: inbox._id.toString() };

    switch (folder) {
      case "sent":
        query.sent = true;
        query.deleted = { $ne: true };
        break;
      case "deleted":
        query.deleted = true;
        break;
      case "inbox":
      default:
        query.sent = false;
        query.deleted = { $ne: true };
        break;
    }

    console.log("Debug - MongoDB query:", JSON.stringify(query, null, 2));

    const messages = await Message.find(query)
      .select(
        "subject from to sent deleted createdAt receivedAt body html read attachments"
      )
      .lean()
      .limit(100)
      .sort({ receivedAt: -1 });

    console.log("Debug - Found messages count:", messages.length);

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Messages API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
