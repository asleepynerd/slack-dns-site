import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../../auth/[...nextauth]/options";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { CDNFile } from "@/lib/models/cdn";
import { connectDB } from "@/lib/db";

// Initialize S3 client with explicit credentials
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true, // Required for R2
});

// Verify credentials are available
if (
  !process.env.R2_ACCESS_KEY_ID ||
  !process.env.R2_SECRET_ACCESS_KEY ||
  !process.env.R2_ACCOUNT_ID
) {
  console.error("Missing R2 credentials");
}

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "cdn-hack-pet";

export const config = {
  maxDuration: 30, // Increase timeout to 30 seconds
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filename, contentType, size } = await req.json();
    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      );
    }

    const slackId = session.user.slackId;
    if (!slackId) {
      return NextResponse.json(
        { error: "Slack ID not found" },
        { status: 400 }
      );
    }

    // Verify R2 credentials are available
    if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
      console.error("R2 credentials not available");
      return NextResponse.json(
        { error: "Storage configuration error" },
        { status: 500 }
      );
    }

    await connectDB();

    const extension = filename.split(".").pop()?.toLowerCase() || "";
    const mimeType = contentType || "application/octet-stream";
    const prefixedFilename = `${slackId}/${filename}`;

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

    // Create database record
    const file = new CDNFile({
      userId: session.user.id,
      slackId,
      key: prefixedFilename,
      filename,
      contentType: mimeType,
      mimeType,
      extension,
      size,
      createdAt: new Date(),
      lastModified: new Date(),
    });

    try {
      await file.save();
    } catch (error: any) {
      if (error.code === 11000) {
        // Handle race condition where file was created between our check and save
        const existing = await CDNFile.findOne({ key: prefixedFilename });
        if (existing) {
          return NextResponse.json(
            {
              error: "File already exists",
              message: "A file with this name was just uploaded",
              existingFile: {
                id: existing._id,
                url: existing.url,
                uploadedAt: existing.createdAt,
              },
            },
            { status: 409 }
          );
        }
      }
      throw error;
    }

    // Generate presigned URL
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: prefixedFilename,
      ContentType: mimeType,
    });

    try {
      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
      return NextResponse.json({ uploadUrl, fileId: file._id });
    } catch (error: any) {
      console.error("Failed to generate presigned URL:", error);
      // Clean up the database record if we couldn't get a URL
      await file.deleteOne();
      return NextResponse.json(
        {
          error: "Failed to get upload URL",
          details:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Get upload URL error:", error);
    return NextResponse.json(
      {
        error: "Failed to get upload URL",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
