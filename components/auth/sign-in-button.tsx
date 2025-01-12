"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function SignInButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await signIn("slack", {
        callbackUrl: "/dashboard",
        redirect: true,
      });

      if (result?.error) {
        console.error("Sign in error:", result.error);
      }
    } catch (error) {
      console.error("Sign in failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignIn}
      className="bg-[#4A154B] hover:bg-[#3a1139] text-white"
      disabled={isLoading}
    >
      {isLoading ? "Signing in..." : "Sign in with Slack"}
    </Button>
  );
}
