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

export async function GET() {
  const session = await getServerSession(options);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  //console.log("session", session);

  const userDomains = await Domain.findOne({ userId: session.user.id });
  return NextResponse.json(userDomains?.domains || []);
}

export async function POST(req: Request) {
  const session = await getServerSession(options);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const { domain, recordType, content } = data;

  // Domain validation
  const domainPattern =
    /^[a-zA-Z0-9-_]+(\.[a-zA-Z0-9-_]+)*\.(is-a-furry\.(dev|net)|sleeping\.wtf|asleep\.pw)$/i;
  if (!domainPattern.test(domain)) {
    return NextResponse.json(
      { error: "Invalid domain format" },
      { status: 400 }
    );
  }

  // Check if domain is taken
  const taken = await isDomainTaken(domain);
  if (taken) {
    return NextResponse.json(
      { error: "Domain already taken" },
      { status: 400 }
    );
  }

  // Create DNS record
  try {
    await createDNSRecord(domain, recordType, content, session.user.id);

    // Save to MongoDB
    const newDomain = {
      domain,
      recordType,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const userDomains = await Domain.findOne({ userId: session.user.id });

    if (userDomains) {
      userDomains.domains.push(newDomain);
      await userDomains.save();
    } else {
      await Domain.create({
        userId: session.user.id,
        domains: [newDomain],
      });
    }

    return NextResponse.json(newDomain);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create domain" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(options);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { domain } = await req.json();

  // Verify user owns domain
  const userDomain = await Domain.findOne({
    userId: session.user.id,
    "domains.domain": domain,
  });

  if (!userDomain) {
    return NextResponse.json(
      { error: "Domain not found or unauthorized" },
      { status: 404 }
    );
  }

  try {
    // Delete from Cloudflare
    await deleteDNSRecord(domain);

    // Remove from MongoDB
    await Domain.updateOne(
      { userId: session.user.id },
      { $pull: { domains: { domain: domain } } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete domain" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const { domain, recordType, content } = data;

  // Domain validation
  const domainPattern =
    /^[a-zA-Z0-9-_]+(\.[a-zA-Z0-9-_]+)*\.(is-a-furry\.(dev|net)|sleeping\.wtf|asleep\.pw)$/i;
  if (!domainPattern.test(domain)) {
    return NextResponse.json(
      { error: "Invalid domain format" },
      { status: 400 }
    );
  }

  // Verify user owns domain
  const userDomain = await Domain.findOne({
    userId: session.user.id,
    "domains.domain": domain,
  });

  if (!userDomain) {
    return NextResponse.json(
      { error: "Domain not found or unauthorized" },
      { status: 404 }
    );
  }

  try {
    // Update Cloudflare DNS record
    await updateDNSRecord(domain, recordType, content, session.user.id);

    // Update MongoDB record
    await Domain.updateOne(
      {
        userId: session.user.id,
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

    return NextResponse.json({
      domain,
      recordType,
      content,
      updatedAt: new Date(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update domain" },
      { status: 500 }
    );
  }
}
