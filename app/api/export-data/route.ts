// @ts-nocheck
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import { Domain } from "@/lib/models/domain";
import { EmailForwarding } from "@/lib/models/email";
import { Link } from "@/lib/models/link";
import { CDNFile } from "@/lib/models/cdn";
import { Inbox, Message } from "@/lib/models/inbox";
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [domains, emailForwarding, links, cdnFiles, inboxes] =
      await Promise.all([
        Domain.findOne({ userId: session.user.slackId }).lean(),
        EmailForwarding.findOne({ userId: session.user.slackId }).lean(),
        Link.find({ userId: session.user.id }).lean(),
        CDNFile.find({ userId: session.user.id }).lean(),
        Inbox.find({ userId: session.user.id }).lean(),
      ]);

    const inboxesWithMessages = await Promise.all(
      inboxes.map(async (inbox) => {
        const messages = await Message.find({ inboxId: inbox._id })
          .select("-__v")
          .lean();
        return {
          ...inbox,
          messages,
        };
      })
    );

    const exportData = {
      exportDate: new Date().toISOString(),
      userData: {
        id: session.user.id,
        email: session.user.email,
        slackId: session.user.slackId,
      },
      domains: domains?.domains || [],
      emailForwarding: emailForwarding?.forwarding || [],
      links,
      cdnFiles,
      inboxes: inboxesWithMessages,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="domains-backup.json"',
      },
    });
  } catch (error) {
    console.error("Export data error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
