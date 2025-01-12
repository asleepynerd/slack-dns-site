export type DNSRecordType =
  | "A"
  | "AAAA"
  | "CNAME"
  | "TXT"
  | "MX"
  | "SRV"
  | "NS";

export interface DNSRecord {
  domain: string;
  recordType: DNSRecordType;
  content: string;
  priority?: number;
  port?: number;
  service?: string;
  protocol?: string;
}

export const DNS_RECORD_TYPES: { value: DNSRecordType; label: string }[] = [
  { value: "A", label: "A Record" },
  { value: "AAAA", label: "AAAA Record" },
  { value: "CNAME", label: "CNAME Record" },
  { value: "TXT", label: "TXT Record" },
  { value: "MX", label: "MX Record" },
  { value: "SRV", label: "SRV Record" },
  { value: "NS", label: "NS Record" },
];
