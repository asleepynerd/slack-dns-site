"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ComposeMessageProps {
  fromEmail: string;
  inboxId: string;
  replyTo?: {
    to: string;
    subject: string;
    body: string;
    isForward?: boolean;
  };
  onClose?: () => void;
}

export function ComposeMessage({
  fromEmail,
  inboxId,
  replyTo,
  onClose,
}: ComposeMessageProps) {
  const [open, setOpen] = useState(!!replyTo);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSending(true);

    try {
      const formData = new FormData(e.currentTarget);

      const response = await fetch("/api/inbox/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: formData.get("to"),
          subject: formData.get("subject"),
          text: formData.get("text"),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send message");
      }

      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
      handleClose();
    } catch (error) {
      console.error("Send error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  }

  if (!replyTo && !open) {
    return (
      <Button onClick={() => setOpen(true)} className="mb-4">
        <Send className="w-4 h-4 mr-2" />
        Compose
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {replyTo
              ? replyTo.isForward
                ? "Forward Message"
                : "Reply"
              : "New Message"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="from">From</Label>
            <Input id="from" value={fromEmail} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input id="to" name="to" defaultValue={replyTo?.to} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              name="subject"
              defaultValue={
                replyTo?.subject
                  ? replyTo.isForward
                    ? `Fwd: ${replyTo.subject}`
                    : `Re: ${replyTo.subject}`
                  : ""
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="text">Message</Label>
            <Textarea
              id="text"
              name="text"
              className="min-h-[200px]"
              defaultValue={
                replyTo
                  ? `\n\n${
                      replyTo.isForward
                        ? "---------- Forwarded message ----------\n"
                        : "On " + new Date().toLocaleString() + ", "
                    } ${replyTo.to} wrote:\n> ${replyTo.body.replace(
                      /\n/g,
                      "\n> "
                    )}`
                  : ""
              }
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSending}>
              {isSending ? "Sending..." : "Send"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
