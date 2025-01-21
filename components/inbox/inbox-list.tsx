"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { InboxCard } from "./inbox-card";
import { CreateInboxDialog } from "./create-inbox-dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Inbox {
  _id: string;
  email: string;
  createdAt: string;
  active: boolean;
}

export function InboxList() {
  const [inboxes, setInboxes] = useState<Inbox[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const fetchInboxes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch("/api/inboxes", {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error("Failed to fetch inboxes");
      const data = await response.json();
      setInboxes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inboxes");
      toast({
        title: "Error",
        description: "Failed to load inboxes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInboxes();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/inboxes/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchInboxes();
      }
    } catch (error) {
      console.error("Failed to delete inbox:", error);
    }
  };

  if (isLoading) {
    return <div className="text-center mt-8">Loading inboxes...</div>;
  }

  if (error) {
    return (
      <div className="text-center mt-8">
        <p className="text-red-400">{error}</p>
        <Button onClick={fetchInboxes} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          Create New Inbox
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {inboxes.map((inbox) => (
          <InboxCard key={inbox.email} inbox={inbox} onDeleted={fetchInboxes} />
        ))}
      </div>

      <CreateInboxDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onInboxCreated={fetchInboxes}
      />
    </div>
  );
}
