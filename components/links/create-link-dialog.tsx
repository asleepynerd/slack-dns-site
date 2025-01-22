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

interface CreateLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLinkCreated: () => void;
}

export function CreateLinkDialog({
  open,
  onOpenChange,
  onLinkCreated,
}: CreateLinkDialogProps) {
  const [destination, setDestination] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create short link");
      }

      const { shortUrl } = await response.json();

      toast({
        title: "Success",
        description: `Short link created: ${shortUrl}`,
      });
      onLinkCreated();
      onOpenChange(false);
      setDestination("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create short link",
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
          <DialogTitle>Create Short Link</DialogTitle>
          <DialogDescription>
            Create a new hackclubber.dev short link
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="destination">Destination URL</Label>
            <Input
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="https://example.com"
              type="url"
              required
            />
          </div>

          <Button type="submit" disabled={isSubmitting || !destination}>
            {isSubmitting ? "Creating..." : "Create Short Link"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
