import { NextResponse } from "next/server";
import { Whitelist } from "@/lib/models/whitelist";
import crypto from "crypto";

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
    const { action, requestId, userId } = JSON.parse(payload.actions[0].value);

    if (payload.user.id !== "U082FBF4MV5") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const request = await Whitelist.findById(requestId);
    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    request.status = action === "approve" ? "approved" : "denied";
    request.decidedAt = new Date();
    request.decidedBy = payload.user.id;
    await request.save();

    await fetch(process.env.SLACK_BOT_TOKEN!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: userId,
        text: `Your inbox access request has been ${request.status}`,
      }),
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
