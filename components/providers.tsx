"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleConnectionError = () => {
      toast({
        title: "Database Error",
        description: "Could not connect to database. Please try again later.",
        variant: "destructive",
      });
    };

    window.addEventListener("unhandledrejection", (event) => {
      if (event.reason?.message?.includes("buffering timed out")) {
        handleConnectionError();
      }
    });

    return () => {
      window.removeEventListener("unhandledrejection", handleConnectionError);
    };
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
