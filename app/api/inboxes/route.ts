import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import { Inbox } from "@/lib/models/inbox";
import { Whitelist } from "@/lib/models/whitelist";
import { connectDB } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

export async function GET(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const inboxes = await Inbox.find({
      userId: session.user.id,
    })
      .select("email address active createdAt lastChecked")
      .lean();

    return NextResponse.json(inboxes);
  } catch (error) {
    console.error("Fetch inboxes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inboxes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const whitelist = await Whitelist.findOne({
      userId: session.user.id,
      status: "approved",
    }).lean();

    if (!whitelist) {
      return NextResponse.json({ error: "Not whitelisted" }, { status: 403 });
    }

    const data = await req.json();
    console.log("Received request data:", data);

    const { subdomain } = data;
    if (!subdomain) {
      return NextResponse.json(
        { error: "Subdomain is required" },
        { status: 400 }
      );
    }

    const email = `${subdomain}@hackclubber.dev`;
    console.log("Constructed email:", email);

    if (!email.endsWith("@hackclubber.dev")) {
      return NextResponse.json(
        { error: "Invalid email domain" },
        { status: 400 }
      );
    }

    const existingInbox = await Inbox.findOne({
      $or: [{ email }, { address: email }],
    }).lean();

    if (existingInbox) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    const inbox = new Inbox({
      userId: session.user.id,
      email: email,
      address: email,
      active: true,
      createdAt: new Date(),
    });

    await inbox.save();

    return NextResponse.json(inbox);
  } catch (error) {
    console.error("Create inbox error:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    return NextResponse.json(
      { error: "Failed to create inbox" },
      { status: 500 }
    );
  }
}
