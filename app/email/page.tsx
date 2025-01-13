import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { options } from "../api/auth/[...nextauth]/options";
import { EmailForwardingList } from "@/components/email/email-forwarding-list";
import { Navbar } from "@/components/layout/navbar";

export default async function EmailPage() {
  const session = await getServerSession(options);

  if (!session) {
    redirect("/");
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-b from-zinc-900 to-black">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent blur-3xl" />
      </div>

      <div className="relative">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Email Forwarding
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              Forward emails from your custom domain to any address
            </p>
          </div>
          <EmailForwardingList />
        </main>
      </div>
    </div>
  );
}
