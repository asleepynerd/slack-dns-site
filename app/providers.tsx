"use client";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { ReactNode } from "react";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || "", {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
    person_profiles: "identified_only",
  });
}

interface CSPostHogProviderProps {
  children: ReactNode;
}

export function CSPostHogProvider({ children }: CSPostHogProviderProps) {
  if (typeof window === "undefined") {
    return <>{children}</>;
  }

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
