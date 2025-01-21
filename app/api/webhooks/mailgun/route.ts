import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Message, Inbox } from "@/lib/models/inbox";
import crypto from "crypto";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const maxDuration = 30;
export const preferredRegion = "iad1"; // US East (N. Virginia)

interface LeanInbox {
  _id: mongoose.Types.ObjectId;
}

function verifyWebhookSignature(
  timestamp: string,
  token: string,
  signature: string,
  signingKey: string
): boolean {
  const encodedToken = crypto
    .createHmac("sha256", signingKey)
    .update(timestamp.concat(token))
    .digest("hex");
  return encodedToken === signature;
}

export async function POST(req: Request) {
  console.log("Mailgun webhook received");
  const startTime = Date.now();

  try {
    const formData = await req.formData();

    // Quick signature verification before any DB operations
    const timestamp = formData.get("timestamp") as string;
    const token = formData.get("token") as string;
    const signature = formData.get("signature") as string;

    if (
      !verifyWebhookSignature(
        timestamp,
        token,
        signature,
        process.env.MAILGUN_WEBHOOK_SIGNING_KEY!
      )
    ) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Extract essential data first
    const recipient = formData.get("recipient") as string;
    const sender = formData.get("sender") as string;
    const subject = formData.get("subject") as string;
    const body = formData.get("body-plain") as string;
    const html = formData.get("body-html") as string;

    console.log("Processing email for recipient:", recipient);

    await connectDB();

    const inbox = await Inbox.findOne({
      $or: [{ email: recipient }, { address: recipient }],
      active: true,
    })
      .select("_id")
      .lean<LeanInbox>();

    if (!inbox) {
      console.error("No active inbox found for recipient:", recipient);
      return NextResponse.json({ error: "Inbox not found" }, { status: 404 });
    }

    // Create message document
    const message = new Message({
      inboxId: inbox._id.toString(),
      from: sender,
      to: recipient,
      subject,
      body,
      html,
      receivedAt: new Date(),
    });

    await message.save();

    const processingTime = Date.now() - startTime;
    console.log(`Webhook processed in ${processingTime}ms`);

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Mailgun webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
