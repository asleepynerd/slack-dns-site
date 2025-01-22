import { NextResponse } from "next/server";
import { Whitelist } from "@/lib/models/whitelist";
import { connectDB } from "@/lib/db";
import crypto from "crypto";
import { slackApp } from "@/lib/slack";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

function verifySlackRequest(req: Request, body: string) {
  const timestamp = req.headers.get("x-slack-request-timestamp");
  const signature = req.headers.get("x-slack-signature");

  const sigBasestring = `v0:${timestamp}:${body}`;
  const mySignature =
    "v0=" +
    crypto
      .createHmac("sha256", process.env.SLACK_SIGNING_SECRET!)
      .update(sigBasestring)
      .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(mySignature),
    Buffer.from(signature!)
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    if (!verifySlackRequest(req, body)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const { action, requestId, userId, slackUserId } = JSON.parse(
      payload.actions[0].value
    );

    if (payload.user.id !== "U082FBF4MV5") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const request = await Whitelist.findByIdAndUpdate(
      requestId,
      {
        $set: {
          status: action === "approve" ? "approved" : "denied",
          decidedAt: new Date(),
          decidedBy: payload.user.id,
        },
      },
      { new: true }
    ).lean();

    await slackApp.client.chat.postMessage({
      channel: slackUserId,
      text: `Your inbox access request has been ${request!.status}`,
    });

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Whitelist webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
