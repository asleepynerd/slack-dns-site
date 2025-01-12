//@ts-nocheck
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import { Domain } from "@/lib/models/domain";
import {
  createDNSRecord,
  isDomainTaken,
  updateDNSRecord,
  deleteDNSRecord,
} from "@/lib/cloudflare";

import mongoose from "mongoose";

mongoose.connect(process.env.MONGODB_URI!);

export async function GET() {
  const session = await getServerSession(options);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("session", session);

  const userDomains = await Domain.findOne({ userId: session.user.slackId });
  return NextResponse.json(userDomains?.domains || []);
}

export async function POST(req: Request) {
  const session = await getServerSession(options);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const { domain, recordType, records } = data;

  const domainPattern =
    /^[a-zA-Z0-9-_]+(\.[a-zA-Z0-9-_]+)*\.(is-a-furry\.(dev|net)|sleeping\.wtf|asleep\.pw|wagging\.dev|furries\.pw|fluff\.pw|floofy\.pw|died\.pw|woah\.pw|trying\.cloud|loves-being-a\.dev|cant-be-asked\.dev|drinks-tea\.uk|doesnt-give-a-fuck\.org|boredom\.dev)$/i;
  if (!domainPattern.test(domain)) {
    return NextResponse.json(
      { error: "Invalid domain format" },
      { status: 400 }
    );
  }

  if (!["MX", "A", "AAAA", "NS"].includes(recordType)) {
    const taken = await isDomainTaken(domain);
    if (taken) {
      return NextResponse.json(
        { error: "Domain already taken" },
        { status: 400 }
      );
    }
  }

  try {
    await createDNSRecord(domain, recordType, records, session.user.id);

    const newRecords = records.map((record) => ({
      domain,
      recordType,
      ...record,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const userDomains = await Domain.findOne({ userId: session.user.slackId });

    if (userDomains) {
      userDomains.domains.push(...newRecords);
      await userDomains.save();
    } else {
      await Domain.create({
        userId: session.user.slackId,
        domains: newRecords,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to create domain:", error);
    return NextResponse.json(
      { error: "Failed to create domain" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(options);
  console.log("Delete - Session user:", session?.user);

  if (!session?.user?.slackId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { domain, recordType } = await req.json();
  console.log("Deleting domain:", domain);

  try {
    await deleteDNSRecord(domain);

    const result = await Domain.updateOne(
      { userId: session.user.slackId },
      {
        $pull: {
          domains: {
            domain: domain,
            recordType: recordType,
          },
        },
      }
    );

    console.log("Delete result:", result);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete domain" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(options);

  if (!session?.user?.slackId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { domain, recordType, content } = await req.json();

  const domainPattern =
    /^[a-zA-Z0-9-_]+(\.[a-zA-Z0-9-_]+)*\.(is-a-furry\.(dev|net)|sleeping\.wtf|asleep\.pw|wagging\.dev|furries\.pw|fluff\.pw|floofy\.pw|died\.pw|woah\.pw|trying\.cloud|loves-being-a\.dev|cant-be-asked\.dev|drinks-tea\.uk|doesnt-give-a-fuck\.org|boredom\.dev)$/i;
  if (!domainPattern.test(domain)) {
    return NextResponse.json(
      { error: "Invalid domain format" },
      { status: 400 }
    );
  }

  const userDomain = await Domain.findOne({
    userId: session.user.slackId,
    "domains.domain": domain,
  });

  if (!userDomain) {
    return NextResponse.json(
      { error: "Domain not found or unauthorized" },
      { status: 404 }
    );
  }

  try {
    const updateResult = await Domain.updateOne(
      {
        userId: session.user.slackId,
        "domains.domain": domain,
      },
      {
        $set: {
          "domains.$.recordType": recordType,
          "domains.$.content": content,
          "domains.$.updatedAt": new Date(),
        },
      }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to update domain" },
        { status: 500 }
      );
    }

    const cloudflareResult = await updateDNSRecord(
      domain,
      recordType,
      content,
      session.user.slackId
    );

    if (!cloudflareResult) {
      return NextResponse.json(
        { error: "Failed to update DNS record" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Failed to update domain" },
      { status: 500 }
    );
  }
}
