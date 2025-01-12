import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { options } from "./api/auth/[...nextauth]/options";
import { SignInButton } from "@/components/auth/sign-in-button";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(options);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-black">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Subdomain <span className="text-blue-500">Manager</span>
        </h1>
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg text-zinc-400">
            Manage your subdomains with ease. Sign in with Slack to get started.
          </p>
          <SignInButton />
        </div>
      </div>
    </div>
  );
}
