import { NextResponse } from "next/server";

export const runtime = "edge";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import { Inbox } from "@/lib/models/inbox";

export async function GET() {
  const session = await getServerSession(options);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const inboxes = await Inbox.find({ userId: session.user.id });
  return NextResponse.json(inboxes);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { subdomain } = data;

    const email = `${subdomain}@hackclubber.dev`;

    const existingInbox = await Inbox.findOne({ email });
    if (existingInbox) {

      return NextResponse.json(
        { error: "Email address already taken" },
        { status: 400 }
      );
    }

    const inbox = new Inbox({
      email,
      userId: session.user.id,
      active: true,
    });

    await inbox.save();

    return NextResponse.json(inbox);
  } catch (error) {
    console.error("Create inbox error:", error);
    return NextResponse.json(
      { error: "Failed to create inbox" },
      { status: 500 }
    );
  }
}
