import {
  S3Client,
  PutObjectCommand,
  PutBucketCorsCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { createReadStream } from "fs";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function uploadAttachment(file: {
  filepath: string;
  originalFilename?: string;
  mimetype?: string;
  size: number;
}) {
  try {
    if (!file.mimetype || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new Error("Invalid file type");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File too large");
    }

    const fileExtension = file.originalFilename?.split(".").pop() || "";
    const randomName = crypto.randomBytes(32).toString("hex");
    const key = `attachments/${randomName}.${fileExtension}`;

    const fileStream = createReadStream(file.filepath);

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET || "",
      Key: key,
      Body: fileStream,
      ContentType: file.mimetype,
      Metadata: {
        originalname: file.originalFilename || "unnamed",
      },
    });

    await s3.send(command);

    const publicUrl = `${process.env.S3_PUBLIC_URL}/${key}`;

    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: 24 * 60 * 60,
    });

    return process.env.S3_PUBLIC_URL ? publicUrl : signedUrl;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}

export async function deleteAttachment(key: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET || "",
      Key: key,
    });

    await s3.send(command);
  } catch (error) {
    console.error("Delete error:", error);
    throw error;
  }
}

export async function configureCors() {
  await s3.send(
    new PutBucketCorsCommand({
      Bucket: process.env.S3_BUCKET || "",
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "PUT", "POST", "DELETE"],
            AllowedOrigins: [process.env.NEXTAUTH_URL || ""],
            ExposeHeaders: [],
            MaxAgeSeconds: 3000,
          },
        ],
      },
    })
  );
}
