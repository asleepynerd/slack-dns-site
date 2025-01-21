import { getServerSession } from "next-auth/next";

export const runtime = "edge";
import { redirect } from "next/navigation";
import { options } from "../api/auth/[...nextauth]/options";
import { DomainList } from "@/components/domains/domain-list";
import { Navbar } from "@/components/layout/navbar";

export default async function DashboardPage() {
  const session = await getServerSession(options);

  if (!session) {
    redirect("/");
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {}
      <div className="fixed inset-0 bg-gradient-to-b from-zinc-900 to-black">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent blur-3xl" />
      </div>

      {}
      <div className="relative">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Your Domains
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              Manage your subdomains and DNS records with ease
            </p>
          </div>
          <DomainList />
        </main>
      </div>
    </div>
  );
}
