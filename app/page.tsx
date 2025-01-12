import { motion } from "framer-motion";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { options } from "./api/auth/[...nextauth]/options";
import { SignInButton } from "@/components/auth/sign-in-button";
import { AnimatedBackground } from "@/components/animated-background";
import { AnimatedTitle } from "@/components/animated-title";

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
      <AnimatedBackground />

      <div className="relative flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <AnimatedTitle />
          <SignInButton />
        </div>
      </div>
    </div>
  );
}
