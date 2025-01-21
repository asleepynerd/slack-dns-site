import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import { Whitelist } from "@/lib/models/whitelist";
import { connectDB } from "@/lib/db";
import { slackApp } from "@/lib/slack";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

interface WhitelistRequest {
  lastRequestAt?: Date;
  requestedAt?: Date;
  _id?: string;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Check for existing request
    const existingRequest = await Whitelist.findOne({
      userId: session.user.id,
    })
      .select("status lastRequestAt requestedAt _id")
      .lean<WhitelistRequest>();

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Check if lastRequestAt exists and is within 24 hours
    if (
      existingRequest?.lastRequestAt &&
      new Date(existingRequest.lastRequestAt) > twentyFourHoursAgo
    ) {
      return NextResponse.json(
        { error: "Please wait 24 hours between requests" },
        { status: 429 }
      );
    }

    // Create or update request
    const updatedRequest = await Whitelist.findOneAndUpdate(
      { userId: session.user.id },
      {
        $set: {
          email: session.user.email,
          status: "pending",
          lastRequestAt: now,
          requestedAt: existingRequest?.requestedAt || now,
          slackUserId: session.user.slackId,
        },
      },
      { upsert: true, new: true }
    ).lean();

    // Send Slack notification
    await slackApp.client.chat.postMessage({
      channel: "U082FBF4MV5", // Your admin user ID
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
                requestId: updatedRequest._id.toString(),
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
                requestId: updatedRequest._id.toString(),
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
