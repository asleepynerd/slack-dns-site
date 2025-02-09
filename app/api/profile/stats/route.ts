import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import { connectDB } from "@/lib/db";
import { Inbox, Message } from "@/lib/models/inbox";
import { Feedback } from "@/lib/models/feedback";
import { Domain } from "@/lib/models/domain";
import { EmailForwarding } from "@/lib/models/email";
import { Link } from "@/lib/models/link";
import { CDNFile } from "@/lib/models/cdn";

export async function GET() {
  const session = await getServerSession(options);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const [
      inboxCount,
      messageCount,
      feedbacks,
      domains,
      emailForwarding,
      links,
      cdnFiles,
    ] = await Promise.all([
      Inbox.countDocuments({ userId: session.user.id, active: true }),
      Message.countDocuments({
        inboxId: {
          $in: (
            await Inbox.find({ userId: session.user.id }).select("_id")
          ).map((inbox) => inbox._id.toString()),
        },
      }),
      Feedback.find({ userId: session.user.id }).select("rating"),
      Domain.countDocuments({ userId: session.user.id }),
      EmailForwarding.countDocuments({ userId: session.user.id }),
      Link.countDocuments({ userId: session.user.id }),
      CDNFile.countDocuments({ userId: session.user.id }),
    ]);

    const averageFeedback =
      feedbacks.length > 0
        ? feedbacks.reduce((acc, curr) => acc + curr.rating, 0) /
          feedbacks.length
        : undefined;

    return NextResponse.json({
      inboxCount,
      messageCount,
      averageFeedback,
      domainCount: domains,
      emailForwardingCount: emailForwarding,
      linkCount: links,
      cdnFileCount: cdnFiles,
    });
  } catch (error) {
    console.error("Error fetching profile stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile stats" },
      { status: 500 }
    );
  }
}
