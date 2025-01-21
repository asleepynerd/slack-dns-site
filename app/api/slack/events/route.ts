// @ts-nocheck
import { NextResponse } from "next/server";
import { slackApp } from "@/lib/slack";
import { Whitelist } from "@/lib/models/whitelist";
import crypto from "crypto";

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

    // Handle URL verification
    if (payload.type === "url_verification") {
      return NextResponse.json({ challenge: payload.challenge });
    }

    // Handle interactive components (buttons, etc.)
    if (payload.type === "block_actions") {
      const action = payload.actions[0];

      if (
        action.action_id === "approve_request" ||
        action.action_id === "deny_request"
      ) {
        const { requestId, userId, slackUserId } = JSON.parse(action.value);
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

        // Notify the user
        await slackApp.client.chat.postMessage({
          channel: slackUserId,
          text: `Your inbox access request has been ${request!.status}`,
        });

        // Update the original message
        await slackApp.client.chat.update({
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
