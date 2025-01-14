import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { options } from "../../auth/[...nextauth]/options";
import {
  createEmailDestination,
  checkEmailVerification,
} from "@/lib/cloudflare";

import mongoose from "mongoose";

mongoose.connect(process.env.MONGODB_URI!);

export async function POST(req: Request) {
  const session = await getServerSession(options);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email } = await req.json();

  try {
    const destination = await createEmailDestination(email);
    const isVerified = await checkEmailVerification(destination.id);

    return NextResponse.json({
      success: true,
      destinationId: destination.id,
      verified: isVerified,
      message: isVerified
        ? "Email verified"
        : "Check your email for verification link",
    });
  } catch (error: any) {
    if (error.message?.includes("already exists")) {
      return NextResponse.json(
        {
          success: false,
          error: "Email already registered",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to verify email", exact_error: error.message },
      { status: 500 }
    );
  }
}
