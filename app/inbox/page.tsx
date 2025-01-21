import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { options } from "../api/auth/[...nextauth]/options";
import { Navbar } from "@/components/layout/navbar";
import { InboxList } from "@/components/inbox/inbox-list";
import { Whitelist } from "@/lib/models/whitelist";
import mongoose from "mongoose";
import clientPromise from "@/lib/mongodb";

export default async function InboxPage() {
  const session = await getServerSession(options);

  if (!session) {
    redirect("/");
  }

  try {
    // Ensure connection is established with timeout
    await Promise.race([
      clientPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("DB Connection timeout")), 5000)
      ),
    ]);

    const whitelist = await Whitelist.findOne({
      userId: session.user.id,
    }).lean();

    if (!whitelist || whitelist.status !== "approved") {
      redirect("/inbox/request");
    }

    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 bg-gradient-to-b from-zinc-900 to-black">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent blur-3xl" />
        </div>

        <div className="relative">
          <Navbar />
          <main className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white">Your Inboxes</h2>
              <p className="mt-4 text-lg text-zinc-400">
                Manage your @hackclubber.dev email addresses
              </p>
            </div>
            <InboxList />
          </main>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Inbox page error:", error);
    // You might want to handle this more gracefully
    redirect("/error?message=Failed+to+load+inbox");
  }
}
