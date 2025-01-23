import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import { Domain } from "@/lib/models/domain";
import { EmailForwarding } from "@/lib/models/email";
import { Link } from "@/lib/models/link";
import { CDNFile } from "@/lib/models/cdn";
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Use slackId instead of id to match other routes
    const [domains, emailForwarding, links, cdnFiles] = await Promise.all([
      Domain.findOne({ userId: session.user.slackId }).lean(),
      EmailForwarding.findOne({ userId: session.user.slackId }).lean(),
      Link.find({ userId: session.user.id }).lean(),
      CDNFile.find({ userId: session.user.id }).lean(),
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      userData: {
        id: session.user.id,
        email: session.user.email,
        slackId: session.user.slackId,
      },
      // Extract domains array from the document
      domains: domains?.domains || [],
      // Extract forwarding array from the document
      emailForwarding: emailForwarding?.forwarding || [],
      links,
      cdnFiles,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="domains-backup.json"',
      },
    });
  } catch (error) {
    console.error("Export data error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
