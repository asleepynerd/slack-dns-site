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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DNSRecord, DNSRecordType, DNS_RECORD_TYPES } from "@/lib/dns-types";

interface EditDomainProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDomainEdited: () => void;
  domain: DNSRecord;
}

export function EditDomainDialog({
  open,
  onOpenChange,
  onDomainEdited,
  domain,
}: EditDomainProps) {
  const [recordType, setRecordType] = useState<DNSRecordType>(
    domain.recordType
  );
  const [content, setContent] = useState(domain.content);
  const [priority, setPriority] = useState(domain.priority || 0);
  const [port, setPort] = useState(domain.port || 0);
  const [service, setService] = useState(domain.service || "");
  const [protocol, setProtocol] = useState(domain.protocol || "_tcp");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data: DNSRecord = {
      domain: domain.domain,
      recordType,
      content,
      ...(recordType === "MX" && { priority }),
      ...(recordType === "SRV" && {
        priority,
        port,
        service,
        protocol,
      }),
    };

    try {
      const res = await fetch("/api/domains", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        onDomainEdited();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Failed to update domain:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Domain Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Domain</Label>
            <Input value={domain.domain} disabled />
          </div>

          <div className="space-y-2">
            <Label>Record Type</Label>
            <Select
              value={recordType}
              onValueChange={(value: string) =>
                setRecordType(value as DNSRecordType)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DNS_RECORD_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {recordType === "SRV" && (
            <>
              <div className="space-y-2">
                <Label>Service</Label>
                <Input
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  placeholder="_minecraft"
                />
              </div>
              <div className="space-y-2">
                <Label>Protocol</Label>
                <Select value={protocol} onValueChange={setProtocol}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_tcp">TCP</SelectItem>
                    <SelectItem value="_udp">UDP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Input
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value))}
                  />
                </div>
              </div>
            </>
          )}

          {recordType === "MX" && (
            <div className="space-y-2">
              <Label>Priority</Label>
              <Input
                type="number"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Content</Label>
            <Input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                recordType === "SRV"
                  ? "hostname.example.com"
                  : recordType === "MX"
                  ? "mail.example.com"
                  : recordType === "A"
                  ? "1.2.3.4"
                  : "Record content"
              }
            />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
