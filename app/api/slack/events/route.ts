// @ts-nocheck
import { NextResponse } from "next/server";

export const runtime = "edge";
import { slackApp } from "@/lib/slack";
import { Whitelist } from "@/lib/models/whitelist";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headers = Object.fromEntries(req.headers.entries());
    console.log("Received Slack event:", {
      contentType: headers["content-type"],
      body: body.slice(0, 500),
    });

    if (
      headers["content-type"]?.includes("application/x-www-form-urlencoded")
    ) {
      const params = new URLSearchParams(body);
      const payload = JSON.parse(params.get("payload") || "{}");
      console.log("Parsed payload:", payload);

      if (payload.type === "block_actions") {
        const action = payload.actions[0];
        console.log("Processing block action:", action);

        if (
          action.action_id === "approve_request" ||
          action.action_id === "deny_request"
        ) {
          const { requestId, userId, slackUserId } = JSON.parse(action.value);
          console.log("Action values:", { requestId, userId, slackUserId });
          const request = await Whitelist.findById(requestId);

          if (!request) {
            console.error("Request not found:", requestId);
            return NextResponse.json(
              { error: "Request not found" },
              { status: 404 }
            );
          }

          request.status =
            action.action_id === "approve_request" ? "approved" : "denied";
          request.decidedAt = new Date();
          request.decidedBy = payload.user.id;
          await request.save();

          console.log("Updated request:", request);

          console.log("Sending DM to:", slackUserId);
          await slackApp.client.chat.postMessage({
            channel: slackUserId,
            text:
              request.status === "approved"
                ? "Your inbox access request has been approved! You can now access the inbox feature!"
                : "Your inbox access request has been denied. You can try again after 24 hours.",
          });

          await slackApp.client.chat.update({
            channel: payload.channel.id,
            ts: payload.message.ts,
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `Request from *${
                    payload.message.text.split("*")[1]
                  }* was ${request.status}`,
                },
              },
            ],
          });

          return NextResponse.json({ ok: true });
        }
      }
    }

    if (headers["content-type"] === "application/json") {
      const jsonBody = JSON.parse(body);
      if (jsonBody.type === "url_verification") {
        return NextResponse.json({ challenge: jsonBody.challenge });
      }
    }

    await slackApp.processEvent({
      body,
      headers,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Slack event error:", error);
    return NextResponse.json(
      { error: "Failed to process event" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
