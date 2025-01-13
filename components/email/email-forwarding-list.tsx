"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmailCard } from "./email-card";
import { AddEmailForwardingDialog } from "./add-email-forwarding-dialog";

interface EmailForwarding {
  fromEmail: string;
  toEmail: string;
  domain: string;
  ruleId: string;
  destinationId: string;
  status: "pending" | "active";
}

export function EmailForwardingList() {
  const [forwardings, setForwardings] = useState<EmailForwarding[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchForwardings = async () => {
    try {
      const response = await fetch("/api/emails");
      if (response.ok) {
        const data = await response.json();
        setForwardings(data);
      }
    } catch (error) {
      console.error("Failed to fetch forwardings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForwardings();
  }, []);

  const handleDelete = async (forwarding: EmailForwarding) => {
    try {
      const response = await fetch("/api/emails", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ruleId: forwarding.ruleId,
          domain: forwarding.domain,
        }),
      });

      if (response.ok) {
        fetchForwardings();
      }
    } catch (error) {
      console.error("Failed to delete forwarding:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setIsAddDialogOpen(true)}>
          Add Email Forwarding
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center text-zinc-400">Loading...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {forwardings.map((forwarding) => (
            <EmailCard
              key={forwarding.ruleId}
              forwarding={forwarding}
              onDelete={() => handleDelete(forwarding)}
            />
          ))}
        </div>
      )}

      <AddEmailForwardingDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onForwardingAdded={fetchForwardings}
      />
    </div>
  );
}
