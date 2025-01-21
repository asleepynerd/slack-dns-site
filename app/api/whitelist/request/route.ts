import { NextResponse } from "next/server";

export const runtime = "edge";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import { Whitelist } from "@/lib/models/whitelist";
import { slackApp } from "@/lib/slack";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Session user:", {
      id: session.user.id,
      slackId: session.user.slackId,
      name: session.user.name,
      email: session.user.email,
    });

    await Whitelist.cleanupOldRequests();

    const canRequest = await Whitelist.canMakeNewRequest(session.user.id);
    if (!canRequest) {
      return NextResponse.json(
        { error: "Please wait 24 hours before requesting again" },
        { status: 429 }
      );
    }

    const existingRequest = await Whitelist.findOne({
      userId: session.user.id,
    });

    let newRequest;
    if (existingRequest) {
      if (existingRequest.status === "approved") {
        return NextResponse.json(
          { error: "You already have access" },
          { status: 400 }
        );
      }

      if (existingRequest.status === "pending") {
        return NextResponse.json(
          { error: "Your request is still pending" },
          { status: 400 }
        );
      }

      existingRequest.status = "pending";
      existingRequest.lastRequestAt = new Date();
      existingRequest.decidedAt = undefined;
      existingRequest.decidedBy = undefined;
      existingRequest.slackUserId = session.user.slackId;
      newRequest = await existingRequest.save();
    } else {
      newRequest = await new Whitelist({
        userId: session.user.id,
        slackUserId: session.user.slackId,
        status: "pending",
        lastRequestAt: new Date(),
      }).save();
    }

    await slackApp.client.chat.postMessage({
      channel: "U082FBF4MV5",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `New inbox access request from *${session.user.name}* (${session.user.email})`,
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Approve",
              },
              style: "primary",
              action_id: "approve_request",
              value: JSON.stringify({
                requestId: newRequest._id.toString(),
                userId: session.user.id,
                slackUserId: session.user.slackId,
              }),
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Deny",
              },
              style: "danger",
              action_id: "deny_request",
              value: JSON.stringify({
                requestId: newRequest._id.toString(),
                userId: session.user.id,
                slackUserId: session.user.slackId,
              }),
            },
          ],
        },
      ],
    });

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Whitelist request error:", error);
    return NextResponse.json(
      { error: "Failed to submit request" },
      { status: 500 }
    );
  }
}
