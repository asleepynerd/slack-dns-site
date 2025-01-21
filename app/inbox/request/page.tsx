"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/navbar";
import { format } from "date-fns";

interface RequestStatus {
  status: "pending" | "approved" | "denied" | null;
  requestedAt?: string;
  decidedAt?: string;
  lastRequestAt?: string;
}

export default function RequestAccessPage() {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<RequestStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/whitelist/status");
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequest = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/whitelist/request", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      toast({
        title: "Request Submitted",
        description: "We'll notify you when your request is reviewed.",
      });

      await fetchStatus();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusDisplay = () => {
    if (isLoading) {
      return <div className="text-zinc-400">Loading status...</div>;
    }

    if (!status || !status.status) {
      return null;
    }

    const statusColors = {
      pending: "text-yellow-500",
      approved: "text-green-500",
      denied: "text-red-500",
    };

    const statusMessages = {
      pending: "Your request is pending review",
      approved: "Your request has been approved! You can now access inboxes.",
      denied: "Your request was denied. You can try again after 24 hours.",
    };

    return (
      <div className="space-y-2">
        <div className={`font-medium ${statusColors[status.status]}`}>
          {statusMessages[status.status]}
        </div>
        <div className="text-sm text-zinc-500">
          {status.requestedAt && (
            <div>Requested: {format(new Date(status.requestedAt), "PPp")}</div>
          )}
          {status.decidedAt && (
            <div>Decided: {format(new Date(status.decidedAt), "PPp")}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-b from-zinc-900 to-black">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent blur-3xl" />
      </div>

      <div className="relative">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h1 className="text-4xl font-bold text-white">
              Request Inbox Access
            </h1>
            <p className="text-lg text-zinc-400">
              The inbox feature is currently in beta and requires approval.
              Request access to get your own @hackclubber.dev email address.
            </p>
            {getStatusDisplay()}
            {(!status?.status || status.status === "denied") && (
              <Button
                onClick={handleRequest}
                disabled={isSubmitting}
                size="lg"
                className="mt-8"
              >
                {isSubmitting ? "Submitting..." : "Request Access"}
              </Button>
            )}
            <p className="text-sm text-zinc-500">
              Note: You can only submit one request every 24 hours. Denied
              requests will be automatically cleaned up after 30 days.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
