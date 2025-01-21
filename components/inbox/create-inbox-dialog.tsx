"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface CreateInboxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInboxCreated: () => void;
}

export function CreateInboxDialog({
  open,
  onOpenChange,
  onInboxCreated,
}: CreateInboxDialogProps) {
  const [subdomain, setSubdomain] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/inboxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subdomain }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create inbox");
      }

      toast({
        title: "Success",
        description: "Inbox created successfully",
      });
      onInboxCreated();
      onOpenChange(false);
      setSubdomain("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create inbox",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Inbox</DialogTitle>
          <DialogDescription>
            Create a new @hackclubber.dev email address
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subdomain">Email Address</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="subdomain"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                placeholder="your-name"
                className="flex-1"
              />
              <span className="text-sm text-zinc-400">@hackclubber.dev</span>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting || !subdomain}>
            {isSubmitting ? "Creating..." : "Create Inbox"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
