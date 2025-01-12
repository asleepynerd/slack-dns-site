import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { options } from "../api/auth/[...nextauth]/options";
import { DomainList } from "@/components/domains/domain-list";

export default async function DashboardPage() {
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

      {/* Floating orbs */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-orbit"
          style={
            {
              "--orbit-duration": `${20 + Math.random() * 30}s`,
              "--orbit-size": `${300 + Math.random() * 400}px`,
              "--orbit-offset-x": `${-200 + Math.random() * 400}px`,
              "--orbit-offset-y": `${-200 + Math.random() * 400}px`,
              left: "50%",
              top: "50%",
            } as any
          }
        ></div>
      ))}

      {/* Content */}
      <div className="relative">
        <nav className="border-b border-zinc-800 bg-zinc-900/30 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">
              Subdomains for <span className="text-blue-500">Hackclubbers</span>
            </h1>
          </div>
        </nav>

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
