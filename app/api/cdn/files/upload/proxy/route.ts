import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../../../auth/[...nextauth]/options";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
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

export const config = {
  api: {
    bodyParser: false, // Disable body parsing, handle streaming directly
  },
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const slackId = session.user.slackId;
    if (!slackId) {
      return NextResponse.json(
        { error: "Slack ID not found" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get file extension and mime type
    const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
    const mimeType = file.type || "application/octet-stream";

    // Prefix the filename with the user's Slack ID
    const prefixedFilename = `${slackId}/${file.name}`;

    // Check if file already exists
    const existingFile = await CDNFile.findOne({
      key: prefixedFilename,
      isDeleted: false,
    });

    if (existingFile) {
      return NextResponse.json(
        {
          error: "File already exists",
          message: "A file with this name already exists in your directory",
          existingFile: {
            id: existingFile._id,
            url: existingFile.url,
            uploadedAt: existingFile.createdAt,
          },
        },
        { status: 409 }
      );
    }

    // Upload to R2 first
    const buffer = await file.arrayBuffer();
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: prefixedFilename,
      Body: Buffer.from(buffer),
      ContentType: mimeType,
    });

    await s3.send(command);

    // Create database record after successful upload
    const fileRecord = new CDNFile({
      userId: session.user.id,
      slackId,
      key: prefixedFilename,
      filename: file.name,
      contentType: mimeType,
      mimeType,
      extension,
      size: file.size,
      createdAt: new Date(),
      lastModified: new Date(),
    });

    try {
      await fileRecord.save();
    } catch (error: any) {
      if (error.code === 11000) {
        // If we hit a race condition, the file is already saved, so we can return success
        const existing = await CDNFile.findOne({ key: prefixedFilename });
        if (existing) {
          return NextResponse.json({
            success: true,
            fileId: existing._id,
            url: existing.url,
          });
        }
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      fileId: fileRecord._id,
      url: fileRecord.url,
    });
  } catch (error) {
    console.error("Upload error:", error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes("file size")) {
        return NextResponse.json(
          { error: "File too large", message: "Maximum file size exceeded" },
          { status: 413 }
        );
      }

      if (error.message.includes("content type")) {
        return NextResponse.json(
          {
            error: "Invalid file type",
            message: "This file type is not allowed",
          },
          { status: 415 }
        );
      }
    }

    return NextResponse.json(
      { error: "Upload failed", message: "Please try again later" },
      { status: 500 }
    );
  }
}
