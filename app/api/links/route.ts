import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import { Link } from "@/lib/models/link";
import { connectDB } from "@/lib/db";
import { nanoid } from "nanoid";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const host = req.headers.get("host");
    if (host !== "hackclubber.dev") {
      return NextResponse.json(
        { error: "Links can only be created on hackclubber.dev" },
        { status: 403 }
      );
    }

    await connectDB();

    const { destination } = await req.json();
    if (!destination) {
      return NextResponse.json(
        { error: "Destination URL is required" },
        { status: 400 }
      );
    }

    let shortCode;
    let exists = true;
    while (exists) {
      shortCode = nanoid(6);
      exists = (await Link.exists({ shortCode })) !== null;
    }

    const link = new Link({
      userId: session.user.id,
      shortCode,
      destination,
      createdAt: new Date(),
    });

    await link.save();

    return NextResponse.json({
      shortUrl: `https://hackclubber.dev/${shortCode}`,
      shortCode,
    });
  } catch (error) {
    console.error("Create link error:", error);
    return NextResponse.json(
      { error: "Failed to create short link" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const host = req.headers.get("host");
    if (host !== "hackclubber.dev") {
      return NextResponse.json(
        { error: "Links can only be accessed on hackclubber.dev" },
        { status: 403 }
      );
    }

    await connectDB();

    const links = await Link.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(links);
  } catch (error) {
    console.error("Fetch links error:", error);
    return NextResponse.json(
      { error: "Failed to fetch links" },
      { status: 500 }
    );
  }
}
