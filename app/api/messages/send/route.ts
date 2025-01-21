import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import { Message, Inbox } from "@/lib/models/inbox";
import { connectDB } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { inboxId, toEmail, subject, text, html } = await req.json();

    // Verify inbox ownership
    const inbox = await Inbox.findOne({
      _id: inboxId,
      userId: session.user.id,
    }).lean();

    if (!inbox) {
      return NextResponse.json({ error: "Inbox not found" }, { status: 404 });
    }

    const message = new Message({
      inboxId,
      from: inbox.email,
      to: toEmail,
      subject,
      body: text,
      html,
      sent: true,
      createdAt: new Date(),
      receivedAt: new Date(),
    });

    await message.save();

    // Send email logic here...

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
