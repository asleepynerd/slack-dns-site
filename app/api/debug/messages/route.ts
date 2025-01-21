import { NextResponse } from "next/server";
import { Message, Inbox } from "@/lib/models/inbox";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connection.asPromise();
    }

    if (!mongoose.connection.db) {
      return NextResponse.json(
        { error: "Database not connected" },
        { status: 500 }
      );
    }

    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    const allMessages = await Message.find().lean();
    const allInboxes = await Inbox.find().lean();

    return NextResponse.json({
      messages: {
        count: allMessages.length,
        items: allMessages.map((msg) => ({
          _id: msg._id,
          inboxId: msg.inboxId,
          subject: msg.subject,
          from: msg.from,
          to: msg.to,
          sent: msg.sent,
          deleted: msg.deleted,
          createdAt: msg.createdAt,
        })),
      },
      inboxes: {
        count: allInboxes.length,
        items: allInboxes.map((inbox) => ({
          _id: inbox._id,
          email: inbox.email,
          userId: inbox.userId,
          active: inbox.active,
        })),
      },
      models: Object.keys(mongoose.models),
      collections: collections.map((c) => c.name),
      connectionState: mongoose.connection.readyState,
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: "Failed to get collections" },
      { status: 500 }
    );
  }
}
