import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { CDNFile } from "@/lib/models/cdn";
import { connectDB } from "@/lib/db";
import { Readable } from "stream";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "cdn-hack-pet";

export async function GET(
  req: Request,
  { params }: { params: { key: string[] } }
) {
  try {
    const key = params.key.join("/");

    await connectDB();

    const file = await CDNFile.getByKey(key);
    if (!file) {
      return new NextResponse("File not found", { status: 404 });
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const obj = await s3.send(command);

    const headers = new Headers();
    if (obj.ContentType) {
      headers.set("Content-Type", obj.ContentType);
    }
    if (obj.ContentLength) {
      headers.set("Content-Length", obj.ContentLength.toString());
    }
    if (obj.LastModified) {
      headers.set("Last-Modified", obj.LastModified.toUTCString());
    }

    headers.set("Cache-Control", "public, max-age=31536000"); 
    headers.set("Access-Control-Allow-Origin", "*");

    if (obj.ContentLength) {
      file.trackView(obj.ContentLength).catch(console.error);
    }

    if (obj.Body instanceof Readable) {
      return new NextResponse(obj.Body as any, { headers });
    }

    throw new Error("Response body is not a readable stream");
  } catch (error) {
    console.error("File serve error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
