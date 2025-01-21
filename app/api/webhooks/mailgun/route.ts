import { NextResponse } from "next/server";
import { Message, Inbox } from "@/lib/models/inbox";
import mongoose from "mongoose";
import { verifyMailgunWebhook } from "@/lib/verify-mailgun-webhook";

export async function POST(req: Request) {
  try {
    const data = await req.formData();

    console.log("Received Mailgun webhook:", {
      sender: data.get("sender"),
      recipient: data.get("recipient"),
      subject: data.get("subject"),
      timestamp: data.get("timestamp"),
    });

    const timestamp = data.get("timestamp") as string;
    const token = data.get("token") as string;
    const signature = data.get("signature") as string;

    if (!verifyMailgunWebhook(timestamp, token, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const incomingEmail = {
      from: data.get("sender") as string,
      to: data.get("recipient") as string,
      subject: data.get("subject") as string,
      body: data.get("body-plain") as string,
      html: data.get("body-html") as string,
      messageId: data.get("Message-Id") as string,
    };

    console.log("Looking for inbox:", incomingEmail.to);

    const inbox = await Inbox.findOne({
      email: incomingEmail.to,
      active: true,
    });

    if (!inbox) {
      console.error("Inbox not found for:", incomingEmail.to);
      return NextResponse.json({ error: "Inbox not found" }, { status: 404 });
    }

    console.log("Found inbox:", {
      _id: inbox._id,
      email: inbox.email,
      userId: inbox.userId,
    });

    const message = new Message({
      ...incomingEmail,
      inboxId: inbox._id.toString(),
      sent: false,
      junk: false,
      deleted: false,
    });

    await message.save();
    console.log("Message saved:", {
      _id: message._id,
      inboxId: message.inboxId,
      subject: message.subject,
    });

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
