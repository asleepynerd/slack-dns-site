"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { InboxCard } from "./inbox-card";
import { CreateInboxDialog } from "./create-inbox-dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Trash2 } from "lucide-react";

interface Inbox {
  _id: string;
  email: string;
  createdAt: string;
  active: boolean;
}

export function InboxList() {
  const [inboxes, setInboxes] = useState<Inbox[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchInboxes();
  }, []);

  const fetchInboxes = async () => {
    try {
      const response = await fetch("/api/inboxes");
      if (response.ok) {
        const data = await response.json();
        setInboxes(data);
      }
    } catch (error) {
      console.error("Failed to fetch inboxes:", error);
    }
  };

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
