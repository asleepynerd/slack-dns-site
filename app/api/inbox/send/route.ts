import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { sendEmail } from "@/lib/mailgun";
import { Message, Inbox } from "@/lib/models/inbox";
import { options } from "../../auth/[...nextauth]/options";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const preferredRegion = "auto";

export async function POST(req: Request) {
  try {
    console.log("1. Starting POST request");

    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("2. Session verified:", session.user.email);

    const { from, to, subject, text } = await req.json();
    console.log("3. Parsed request body:", { from, to, subject });

    if (!from || !to || !subject || !text) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const inbox = await Inbox.findOne({
      $or: [
        { email: from, userId: session.user.id },
        { address: from, userId: session.user.id },
      ],
    });
    console.log("4. Found inbox:", inbox?._id, "for address:", from);

    if (!inbox) {
      return NextResponse.json({ error: "Inbox not found" }, { status: 404 });
    }

    const message = new Message({
      inboxId: inbox._id,
      from,
      to,
      subject,
      body: text,
      sent: true,
      createdAt: new Date(),
    });
    await message.save();
    console.log("5. Saved message to database");

    await sendEmail({
      from,
      to,
      subject,
      text,
    });
    console.log("6. Sent email via Mailgun");

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Send error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to send message",
      },
      { status: 500 }
    );
  }
}
