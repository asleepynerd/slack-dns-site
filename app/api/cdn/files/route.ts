import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { CDNFile } from "@/lib/models/cdn";
import { connectDB } from "@/lib/db";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "cdn-hack-pet";
const CDN_DOMAIN = "cdn.hack.pet";
// WHY WONT THIS FUCKING WORK

export async function GET() {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const slackId = session.user.slackId;
    if (!slackId) {
      return NextResponse.json(
        { error: "Slack ID not found" },
        { status: 400 }
      );
    }

    await connectDB();

    const files = await CDNFile.getActiveFiles(session.user.id);

    const mappedFiles = files.map((file) => ({
      key: file.key,
      displayKey: file.filename,
      size: file.size,
      lastModified: file.lastModified,
      url: file.url,
      contentType: file.contentType,
      extension: file.extension,
      views: file.views,
      bandwidth: file.bandwidth,
      lastViewed: file.lastViewed,
    }));

    return NextResponse.json(mappedFiles);
  } catch (error) {
    console.error("List files error:", error);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 }
    );
  }
}
