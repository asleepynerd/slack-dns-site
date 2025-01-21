import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { options } from "../auth/[...nextauth]/options";
import { EmailForwarding } from "@/lib/models/email";
import { createEmailRule, deleteEmailRule } from "@/lib/cloudflare";
import { config } from "@/lib/cloudflare";

import mongoose from "mongoose";

mongoose.connect(process.env.MONGODB_URI!);

export async function GET() {
  const session = await getServerSession(options);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userForwarding = await EmailForwarding.findOne({
    userId: session.user.slackId,
  });
  return NextResponse.json(userForwarding?.forwarding || []);
}

export async function POST(req: Request) {
  const session = await getServerSession(options);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fromEmail, toEmail, domain, destinationId } = await req.json();

  try {
    const zoneId = config.cloudflareZones[domain];
    if (!zoneId) {
      throw new Error(`No zone ID found for domain: ${domain}`);
    }

    const rule = await createEmailRule(zoneId, fromEmail, toEmail);

    await EmailForwarding.findOneAndUpdate(
      { userId: session.user.slackId },
      {
        $push: {
          forwarding: {
            fromEmail,
            toEmail,
            domain,
            ruleId: rule.id,
            destinationId,
            status: "active",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to create forwarding:", error);
    return NextResponse.json(
      { error: "Failed to create forwarding" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(options);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ruleId, domain } = await req.json();

  try {
    const zoneId = config.cloudflareZones[domain];
    await deleteEmailRule(zoneId, ruleId);

    await EmailForwarding.updateOne(
      { userId: session.user.slackId },
      { $pull: { forwarding: { ruleId } } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete forwarding:", error);
    return NextResponse.json(
      { error: "Failed to delete forwarding" },
      { status: 500 }
    );
  }
}
