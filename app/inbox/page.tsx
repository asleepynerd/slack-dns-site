import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { options } from "../api/auth/[...nextauth]/options";
import { Whitelist } from "@/lib/models/whitelist";
import { connectDB } from "@/lib/db";
import { InboxPageClient } from "@/components/inbox/inbox-page-client";

export default async function InboxPage() {
  const session = await getServerSession(options);

  if (!session) {
    redirect("/");
  }

  try {
    await connectDB();

    const whitelist = await Whitelist.findOne({
      userId: session.user.id,
    }).lean();

    if (!whitelist || whitelist.status !== "approved") {
      redirect("/inbox/request");
    }

    return <InboxPageClient />;
  } catch (error) {
    console.error("Inbox page error:", error);
    redirect("/inbox/request");
  }
}
