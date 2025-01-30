import { motion } from "framer-motion";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { options } from "./api/auth/[...nextauth]/options";
import { SignInButton } from "@/components/auth/sign-in-button";
import { AnimatedBackground } from "@/components/animated-background";
import { AnimatedTitle } from "@/components/animated-title";
import { Navbar } from "@/components/layout/navbar";

const floatingElements = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  size: Math.random() * 20 + 10,
  initialX: Math.random() * 100 - 50,
  initialY: Math.random() * 100 - 50,
}));

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(options);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-b from-zinc-900 to-black">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent blur-3xl" />
        <div className="absolute inset-0">
          <AnimatedBackground />
        </div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="container flex flex-col items-center justify-center gap-12 px-4">
            <AnimatedTitle />
            <SignInButton />
          </div>
        </main>
      </div>
    </div>
  );
}
