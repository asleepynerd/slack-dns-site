// @ts-nocheck
import { NextResponse } from "next/server";
import { slackApp } from "@/lib/slack";
import { Whitelist } from "@/lib/models/whitelist";
import crypto from "crypto";
import { connectDB } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 15;
export const preferredRegion = "iad1"; // US East (N. Virginia)

function verifySlackRequest(req: Request, body: string) {
  const timestamp = req.headers.get("x-slack-request-timestamp");
  const signature = req.headers.get("x-slack-signature");

  if (!timestamp || !signature) return false;

  // Verify request is not older than 5 minutes
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;
  if (parseInt(timestamp) < fiveMinutesAgo) return false;

  const sigBasestring = `v0:${timestamp}:${body}`;
  const mySignature =
    "v0=" +
    crypto
      .createHmac("sha256", process.env.SLACK_SIGNING_SECRET!)
      .update(sigBasestring)
      .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(mySignature),
    Buffer.from(signature)
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const contentType = req.headers.get("content-type") || "";

    // Quick verification before processing
    if (!verifySlackRequest(req, body)) {
      console.error("Invalid Slack signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let payload;
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const params = new URLSearchParams(body);
      const payloadStr = params.get("payload");
      if (payloadStr) {
        payload = JSON.parse(payloadStr);
      } else {
        // Handle non-interactive messages
        const bodyParams = Object.fromEntries(params.entries());
        payload = bodyParams;
      }
    } else {
      payload = JSON.parse(body);
    }

    console.log("Received Slack event:", {
      type: payload.type,
      event: payload.event?.type,
    });

    // Handle URL verification without DB
    if (payload.type === "url_verification") {
      return NextResponse.json({ challenge: payload.challenge });
    }

    // Connect to DB before any database operations
    await connectDB();

    // Handle interactive components (buttons, etc.)
    if (payload.type === "block_actions") {
      const action = payload.actions[0];

      if (
        action.action_id === "approve_request" ||
        action.action_id === "deny_request"
      ) {
        console.log("Processing request action:", {
          actionId: action.action_id,
          value: action.value,
        });

        const { requestId, userId, slackUserId } = JSON.parse(action.value);

        // First verify the request exists
        const existingRequest = await Whitelist.findById(requestId).lean();
        if (!existingRequest) {
          console.error("Request not found:", requestId);
          return NextResponse.json(
            { error: "Request not found" },
            { status: 404 }
          );
        }

        // Update the request
        const request = await Whitelist.findByIdAndUpdate(
          requestId,
          {
            $set: {
              status:
                action.action_id === "approve_request" ? "approved" : "denied",
              decidedAt: new Date(),
              decidedBy: payload.user.id,
            },
          },
          { new: true }
        ).lean();

        console.log("Updated request:", request);

        // Notify the user
        const notifyResult = await slackApp.client.chat.postMessage({
          channel: slackUserId,
          text: `Your inbox access request has been ${request!.status}`,
        });

        console.log("Notification sent:", notifyResult);

        // Update the original message
        const updateResult = await slackApp.client.chat.update({
          channel: payload.channel.id,
          ts: payload.message.ts,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `Request was ${request!.status}`,
              },
            },
          ],
        });

        console.log("Message updated:", updateResult);

        return NextResponse.json({ ok: true });
      }
    }

    // Handle events
    if (payload.type === "event_callback") {
      const { event } = payload;

      switch (event.type) {
        case "app_home_opened":
          // Handle app home opened event
          await handleAppHomeOpened(event);
          break;
        // Add other event handlers as needed
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Slack events error:", error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleAppHomeOpened(event: any) {
  try {
    // Implement minimal app home view
    await slackApp.client.views.publish({
      user_id: event.user,
      view: {
        type: "home",
        blocks: [
          {
            type: "header",
            block_id: "header",
            text: {
              type: "plain_text",
              text: "🌐 Your Registered Domains",
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Manage your domains and email inboxes here.",
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error("Error updating app home:", error);
  }
}
