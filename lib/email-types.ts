export interface EmailDestination {
  id: string;
  email: string;
  verified: string;
  created: string;
  modified: string;
}

export interface EmailRoutingRule {
  id: string;
  name: string;
  enabled: boolean;
  actions: Array<{
    type: string;
    value: string[];
  }>;
  matchers: Array<{
    field: string;
    type: string;
    value: string;
  }>;
}

export interface EmailForwarding {
  fromEmail: string;
  toEmail: string;
  domain: string;
  ruleId: string;
  destinationId: string;
  status: "pending" | "active";
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailForwardingDocument {
  userId: string;
  forwarding: EmailForwarding[];
}
