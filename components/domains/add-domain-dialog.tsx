//@ts-nocheck
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
import { DNSRecordType, DNS_RECORD_TYPES } from "@/lib/dns-types";
import { X } from "lucide-react";
import { config as CfCfg } from "@/lib/cloudflare";
import { toast } from "@/hooks/use-toast";
import { DNS_TEMPLATES } from "@/lib/dns-templates";

interface AddDomainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDomainAdded: () => void;
}

export function AddDomainDialog({
  open,
  onOpenChange,
  onDomainAdded,
}: AddDomainDialogProps) {
  const [subdomain, setSubdomain] = useState("");
  const [subdomainError, setSubdomainError] = useState("");
  const [selectedDomain, setSelectedDomain] = useState(
    Object.keys(CfCfg.cloudflareZones)[0]
  );
  const [recordType, setRecordType] = useState<DNSRecordType>("A");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mxRecords, setMxRecords] = useState([{ priority: 0, content: "" }]);
  const [aRecords, setARecords] = useState([{ content: "" }]);
  const [aaaaRecords, setAAAARecords] = useState([{ content: "" }]);
  const [nsRecords, setNSRecords] = useState([{ content: "" }]);
  const [cnameRecords, setCnameRecords] = useState([{ content: "" }]);
  const [txtRecords, setTxtRecords] = useState([{ content: "" }]);
  const [selectedTemplate, setSelectedTemplate] = useState("custom");

  const resetForm = () => {
    setSubdomain("");
    setSubdomainError("");
    setRecordType("A");
    setMxRecords([{ priority: 0, content: "" }]);
    setARecords([{ content: "" }]);
    setAAAARecords([{ content: "" }]);
    setNSRecords([{ content: "" }]);
    setCnameRecords([{ content: "" }]);
    setTxtRecords([{ content: "" }]);
  };

  const addRecord = (type: DNSRecordType) => {
    switch (type) {
      case "MX":
        setMxRecords([...mxRecords, { priority: 0, content: "" }]);
        break;
      case "A":
        setARecords([...aRecords, { content: "" }]);
        break;
      case "AAAA":
        setAAAARecords([...aaaaRecords, { content: "" }]);
        break;
      case "NS":
        setNSRecords([...nsRecords, { content: "" }]);
        break;
      case "CNAME":
        setCnameRecords([...cnameRecords, { content: "" }]);
        break;
      case "TXT":
        setTxtRecords([...txtRecords, { content: "" }]);
        break;
    }
  };

  const removeRecord = (type: DNSRecordType, index: number) => {
    switch (type) {
      case "MX":
        setMxRecords(mxRecords.filter((_, i) => i !== index));
        break;
      case "A":
        setARecords(aRecords.filter((_, i) => i !== index));
        break;
      case "AAAA":
        setAAAARecords(aaaaRecords.filter((_, i) => i !== index));
        break;
      case "NS":
        setNSRecords(nsRecords.filter((_, i) => i !== index));
        break;
      case "CNAME":
        setCnameRecords(cnameRecords.filter((_, i) => i !== index));
        break;
      case "TXT":
        setTxtRecords(txtRecords.filter((_, i) => i !== index));
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subdomain.trim()) {
      setSubdomainError("Subdomain is required");
      return;
    }

    setIsSubmitting(true);

    const fullDomain = subdomain
      ? `${subdomain}.${selectedDomain}`
      : selectedDomain;

    const records = {
      domain: fullDomain,
      recordType,
      records:
        recordType === "MX"
          ? mxRecords
          : recordType === "A"
          ? aRecords
          : recordType === "AAAA"
          ? aaaaRecords
          : recordType === "NS"
          ? nsRecords
          : recordType === "CNAME"
          ? cnameRecords
          : recordType === "TXT"
          ? txtRecords
          : [{ content: "" }],
    };

    try {
      const response = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(records),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Domain ${fullDomain} added successfully`,
        });
        resetForm();
        onDomainAdded();
        onOpenChange(false);
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error("Failed to add domain:", error);
      toast({
        title: "Error",
        description: "Failed to add domain. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubdomain(e.target.value);
    setSubdomainError("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) resetForm();
        onOpenChange(open);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Domain</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Subdomain <span className="text-red-500">*</span>
              </Label>
              <Input
                value={subdomain}
                onChange={handleSubdomainChange}
                placeholder="subdomain"
                required
                className={subdomainError ? "border-red-500" : ""}
              />
              {subdomainError && (
                <p className="text-sm text-red-500">{subdomainError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Domain</Label>
              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(CfCfg.cloudflareZones).map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              Full domain:{" "}
              <span className="font-mono">
                {subdomain ? `${subdomain}.${selectedDomain}` : selectedDomain}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Template</Label>
            <Select
              value={selectedTemplate}
              onValueChange={(value) => {
                setSelectedTemplate(value);
                if (value !== "custom") {
                  const template = DNS_TEMPLATES[value];
                  const firstRecord = template.records[0];
                  setRecordType(firstRecord.type as DNSRecordType);

                  switch (firstRecord.type) {
                    case "MX":
                      setMxRecords(firstRecord.data);
                      break;
                    case "A":
                      setARecords(firstRecord.data);
                      break;
                    // ... handle other record types
                  }
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DNS_TEMPLATES).map(([key, template]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex flex-col">
                      <span>{template.name}</span>
                      <span className="text-xs text-zinc-400">
                        {template.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate === "custom" && (
            <div className="space-y-2">
              <Label>Record Type</Label>
              <Select
                value={recordType}
                onValueChange={(value) => setRecordType(value as DNSRecordType)}
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
          )}

          {recordType === "MX" && (
            <div className="space-y-4">
              {mxRecords.map((record, index) => (
                <RecordInput
                  key={index}
                  type="MX"
                  record={record}
                  index={index}
                  onRemove={() => removeRecord("MX", index)}
                  onChange={(value) => {
                    const newRecords = [...mxRecords];
                    newRecords[index] = value;
                    setMxRecords(newRecords);
                  }}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addRecord("MX")}
                className="w-full"
              >
                Add MX Record
              </Button>
            </div>
          )}

          {recordType === "A" && (
            <div className="space-y-4">
              {aRecords.map((record, index) => (
                <RecordInput
                  key={index}
                  type="A"
                  record={record}
                  index={index}
                  onRemove={() => removeRecord("A", index)}
                  onChange={(value) => {
                    const newRecords = [...aRecords];
                    newRecords[index] = value;
                    setARecords(newRecords);
                  }}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addRecord("A")}
                className="w-full"
              >
                Add A Record
              </Button>
            </div>
          )}

          {recordType === "AAAA" && (
            <div className="space-y-4">
              {aaaaRecords.map((record, index) => (
                <RecordInput
                  key={index}
                  type="AAAA"
                  record={record}
                  index={index}
                  onRemove={() => removeRecord("AAAA", index)}
                  onChange={(value) => {
                    const newRecords = [...aaaaRecords];
                    newRecords[index] = value;
                    setAAAARecords(newRecords);
                  }}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addRecord("AAAA")}
              >
                Add AAAA Record
              </Button>
            </div>
          )}

          {recordType === "NS" && (
            <div className="space-y-4">
              {nsRecords.map((record, index) => (
                <RecordInput
                  key={index}
                  type="NS"
                  record={record}
                  index={index}
                  onRemove={() => removeRecord("NS", index)}
                  onChange={(value) => {
                    const newRecords = [...nsRecords];
                    newRecords[index] = value;
                    setNSRecords(newRecords);
                  }}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addRecord("NS")}
              >
                Add NS Record
              </Button>
            </div>
          )}

          {recordType === "CNAME" && (
            <div className="space-y-4">
              {cnameRecords.map((record, index) => (
                <RecordInput
                  key={index}
                  type="CNAME"
                  record={record}
                  index={index}
                  onRemove={() => removeRecord("CNAME", index)}
                  onChange={(value) => {
                    const newRecords = [...cnameRecords];
                    newRecords[index] = value;
                    setCnameRecords(newRecords);
                  }}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addRecord("CNAME")}
                className="w-full"
              >
                Add CNAME Record
              </Button>
            </div>
          )}

          {recordType === "TXT" && (
            <div className="space-y-4">
              {txtRecords.map((record, index) => (
                <RecordInput
                  key={index}
                  type="TXT"
                  record={record}
                  index={index}
                  onRemove={() => removeRecord("TXT", index)}
                  onChange={(value) => {
                    const newRecords = [...txtRecords];
                    newRecords[index] = value;
                    setTxtRecords(newRecords);
                  }}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addRecord("TXT")}
                className="w-full"
              >
                Add TXT Record
              </Button>
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-800 border-t-white" />
                <span>Adding Domain...</span>
              </div>
            ) : (
              "Add Domain"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RecordInput({ type, record, index, onRemove, onChange }) {
  return (
    <div className="flex items-end space-x-2">
      {type === "MX" && (
        <div className="space-y-2 w-24">
          <Label>Priority</Label>
          <Input
            type="number"
            value={record.priority}
            onChange={(e) =>
              onChange({ ...record, priority: Number(e.target.value) })
            }
          />
        </div>
      )}
      <div className="space-y-2 flex-1">
        <Label>Content</Label>
        <Input
          value={record.content}
          onChange={(e) => onChange({ ...record, content: e.target.value })}
          placeholder={
            type === "A"
              ? "1.2.3.4"
              : type === "AAAA"
              ? "2001:db8::1"
              : type === "NS"
              ? "ns1.example.com"
              : type === "MX"
              ? "mail.example.com"
              : type === "CNAME"
              ? "target.example.com"
              : type === "TXT"
              ? "v=spf1 include:_spf.example.com ~all"
              : "Record content"
          }
        />
      </div>
      <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
