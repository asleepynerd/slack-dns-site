//@ts-nocheck
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { config } from "@/lib/cloudflare";

export function AddEmailForwardingDialog({
  open,
  onOpenChange,
  onForwardingAdded,
}) {
  const [subdomain, setSubdomain] = useState("");
  const [domain, setDomain] = useState(Object.keys(config.cloudflareZones)[0]);
  const [toEmail, setToEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [destinationId, setDestinationId] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isVerifying && destinationId) {
      interval = setInterval(async () => {
        try {
          const response = await fetch(
            `/api/emails/status?id=${destinationId}`,
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to check status");
          }

          const data = await response.json();
          if (data.verified) {
            await createForwardingRule();
            clearInterval(interval);
          }
        } catch (error) {
          console.error("Status check failed:", error);
          toast({
            title: "Error",
            description: "Failed to check verification status",
            variant: "destructive",
          });
          setIsVerifying(false);
        }
      }, 5000);
    }

    return () => clearInterval(interval);
  }, [isVerifying, destinationId]);

  const createForwardingRule = async () => {
    const fromEmail = `${subdomain}@${domain}`;

    try {
      const response = await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromEmail,
          toEmail,
          domain,
          destinationId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create forwarding rule");
      }

      toast({
        title: "Success",
        description: "Email forwarding created successfully",
      });
      onForwardingAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create forwarding:", error);
      toast({
        title: "Error",
        description: "Failed to create forwarding rule",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/emails/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: toEmail }),
      });

      if (!response.ok) {
        throw new Error("Failed to verify email");
      }

      const data = await response.json();

      if (data.success) {
        setDestinationId(data.destinationId);
        if (data.verified) {
          await createForwardingRule();
        } else {
          setIsVerifying(true);
          toast({
            title: "Verification Required",
            description: "Please check your email for verification link",
          });
        }
      }
    } catch (error) {
      console.error("Failed to start verification:", error);
      toast({
        title: "Error",
        description: "Failed to verify email",
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
          <DialogTitle>Add Email Forwarding</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Username</Label>
            <div className="flex items-center gap-2">
              <Input
                className="w-[200px]"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                placeholder="username"
                required
              />
              @
              <Select value={domain} onValueChange={setDomain}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(config.cloudflareZones).map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Forward To</Label>
            <Input
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              placeholder="your@email.com"
              required
              type="email"
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting || isVerifying}
            className="w-full"
          >
            {isSubmitting ? (
              "Checking..."
            ) : isVerifying ? (
              <span>
                Waiting for verification... (check your
                email)
              </span>
            ) : (
              "Add Forwarding"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
