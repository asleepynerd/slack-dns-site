import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { options } from "../../api/auth/[...nextauth]/options";
import { Inbox } from "@/lib/models/inbox";
import { Navbar } from "@/components/layout/navbar";
import { MessageList } from "@/components/inbox/message-list";
import clientPromise from "@/lib/mongodb";
import mongoose from "mongoose";
import { ComposeMessage } from "@/components/inbox/compose-message";

export default async function InboxPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(options);
  if (!session) {
    redirect("/");
  }

  await clientPromise;

  try {
    const inbox = await Inbox.findOne({
      _id: new mongoose.Types.ObjectId(params.id),
      userId: session.user.id,
      active: true,
    });

    if (!inbox) {
      redirect("/inbox");
    }

    return (
      <div className="relative min-h-screen overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-b from-zinc-900 to-black">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent blur-3xl" />
        </div>

        <div className="relative">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-white">
                    {inbox.email}
                  </h2>
                  <p className="text-zinc-400">Your email inbox</p>
                </div>
                <ComposeMessage
                  fromEmail={inbox.email}
                  inboxId={inbox._id.toString()}
                />
              </div>
            </div>
            <MessageList inboxId={inbox._id.toString()} />
          </main>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading inbox:", error);
    redirect("/inbox");
  }
}
