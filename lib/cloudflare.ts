import { EmailDestination, EmailRoutingRule } from "./email-types";
import fs from "fs";

export interface CloudflareConfig {
  cloudflareZones: {
    [key: string]: string;
  };
}

export const config: CloudflareConfig = {
  cloudflareZones: {
    "is-a-furry.dev": process.env.CLOUDFLARE_ZONE_ID_DEV!,
    "is-a-furry.net": process.env.CLOUDFLARE_ZONE_ID_NET!,
    "sleeping.wtf": process.env.CLOUDFLARE_ZONE_ID_SLEEPING_WTF!,
    "asleep.pw": process.env.CLOUDFLARE_ZONE_ID_ASLEEP_PW!,
    "wagging.dev": process.env.CLOUDFLARE_ZONE_ID_WAGGING_DEV!,
    "furries.pw": process.env.CLOUDFLARE_ZONE_ID_FURRIES_PW!,
    "fluff.pw": process.env.CLOUDFLARE_ZONE_ID_FLUFF_PW!,
    "floofy.pw": process.env.CLOUDFLARE_ZONE_ID_FLOOFY_PW!,
    "died.pw": process.env.CLOUDFLARE_ZONE_ID_DIED_PW!,
    "woah.pw": process.env.CLOUDFLARE_ZONE_ID_WOAH_PW!,
    "trying.cloud": process.env.CLOUDFLARE_ZONE_ID_TRYING_CLOUD!,
    "loves-being-a.dev": process.env.CLOUDFLARE_ZONE_ID_LOVES_BEING_A_DEV!,
    "cant-be-asked.dev": process.env.CLOUDFLARE_ZONE_ID_CANT_BE_ASKED_DEV!,
    "drinks-tea.uk": process.env.CLOUDFLARE_ZONE_ID_DRINKS_TEA_UK!,
    "doesnt-give-a-fuck.org":
      process.env.CLOUDFLARE_ZONE_ID_DOESNT_GIVE_A_FUCK_ORG!,
    "boredom.dev": process.env.CLOUDFLARE_ZONE_ID_BOREDOM_DEV!,
    "verygay.xyz": process.env.CLOUDFLARE_ZONE_ID_VERYGAY_XYZ!,
  },
};

const CLOUDFLARE_API_URL = "https://api.cloudflare.com/client/v4";

export async function isDomainTaken(domain: string): Promise<boolean> {
  const parts = domain.split(".");
  const tld = parts.pop();
  const sld = parts.pop();
  const baseDomain = `${sld}.${tld}`;
  const zoneId = config.cloudflareZones[baseDomain];

  if (!zoneId) return false;

  const response = await fetch(
    `${CLOUDFLARE_API_URL}/zones/${zoneId}/dns_records`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      },
    }
  );

  const data = await response.json();
  return data.result.some((record: any) => record.name === domain);
}

export async function createDNSRecord(
  domain: string,
  recordType: string,
  records: Array<{ content: string; priority?: number }>,
  userId: string,
  proxied = false
) {
  const parts = domain.split(".");
  const baseDomain = parts.slice(-2).join(".");
  const zoneId = config.cloudflareZones[baseDomain];

  if (!zoneId) {
    throw new Error(`No zone ID found for domain: ${baseDomain}`);
  }

  const createPromises = records.map((record) =>
    fetch(`${CLOUDFLARE_API_URL}/zones/${zoneId}/dns_records`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: recordType,
        name: domain,
        content: record.content,
        proxied,
        priority: record.priority,
        comment: `Created by user: ${userId}`,
      }),
    })
  );

  const results = await Promise.all(createPromises);

  const failed = results.filter((r) => !r.ok);
  if (failed.length > 0) {
    throw new Error("Failed to create some DNS records");
  }

  return results.map((r) => r.json());
}

export async function updateDNSRecord(
  domain: string,
  recordType: string,
  content: string,
  userId: string
): Promise<boolean> {
  const parts = domain.split(".");
  const baseDomain = parts.slice(-2).join(".");
  const zoneId = config.cloudflareZones[baseDomain];

  if (!zoneId) {
    throw new Error(`No zone ID found for domain: ${baseDomain}`);
  }

  const records = await fetch(
    `${CLOUDFLARE_API_URL}/zones/${zoneId}/dns_records`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      },
    }
  );

  const data = await records.json();
  const record = data.result.find((r: any) => r.name === domain);

  if (!record) {
    throw new Error(`No existing record found for ${domain}`);
  }

  const response = await fetch(
    `${CLOUDFLARE_API_URL}/zones/${zoneId}/dns_records/${record.id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: recordType,
        name: domain,
        content: content,
        proxied: record.proxied,
        comment: `Updated by user: ${userId}`,
      }),
    }
  );

  return response.ok;
}

export async function deleteDNSRecord(domain: string): Promise<boolean> {
  const parts = domain.split(".");
  const baseDomain = parts.slice(-2).join(".");
  const zoneId = config.cloudflareZones[baseDomain];

  if (!zoneId) {
    throw new Error(`No zone ID found for domain: ${baseDomain}`);
  }

  const records = await fetch(
    `${CLOUDFLARE_API_URL}/zones/${zoneId}/dns_records`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      },
    }
  );

  const data = await records.json();
  const record = data.result.find((r: any) => r.name === domain);

  if (!record) {
    throw new Error(`No DNS record found for ${domain}`);
  }

  const response = await fetch(
    `${CLOUDFLARE_API_URL}/zones/${zoneId}/dns_records/${record.id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      },
    }
  );

  return response.ok;
}

export async function createEmailDestination(
  email: string
): Promise<EmailDestination> {
  const response = await fetch(
    `${CLOUDFLARE_API_URL}/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/email/routing/addresses`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY!}`,
        "X-Auth-Email": process.env.CLOUDFLARE_API_EMAIL!,
        "X-Auth-Key": process.env.CLOUDFLARE_GLOBAL_KEY!,
      },
      body: JSON.stringify({ email }),
    }
  );

  const data = await response.json();
  console.log(data);
  if (!data.success) throw new Error(data.errors[0].message);
  return data.result;
}

export async function checkEmailVerification(
  destinationId: string
): Promise<boolean> {
  const response = await fetch(
    `${CLOUDFLARE_API_URL}/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/email/routing/addresses/${destinationId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY!}`,
        "X-Auth-Email": process.env.CLOUDFLARE_API_EMAIL!,
        "X-Auth-Key": process.env.CLOUDFLARE_GLOBAL_KEY!,
      },
    }
  );

  const data = await response.json();
  if (!data.success) throw new Error(data.errors[0].message);
  return !!data.result.verified;
}

export async function createEmailRule(
  zoneId: string,
  fromEmail: string,
  toEmail: string
): Promise<EmailRoutingRule> {
  const response = await fetch(
    `${CLOUDFLARE_API_URL}/zones/${zoneId}/email/routing/rules`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY!}`,
        "X-Auth-Email": process.env.CLOUDFLARE_API_EMAIL!,
        "X-Auth-Key": process.env.CLOUDFLARE_GLOBAL_KEY!,
      },
      body: JSON.stringify({
        name: `Forward ${fromEmail} to ${toEmail}`,
        enabled: true,
        actions: [{ type: "forward", value: [toEmail] }],
        matchers: [{ field: "to", type: "literal", value: fromEmail }],
      }),
    }
  );

  const data = await response.json();
  if (!data.success) throw new Error(data.errors[0].message);
  return data.result;
}

export async function deleteEmailRule(
  zoneId: string,
  ruleId: string
): Promise<boolean> {
  const response = await fetch(
    `${CLOUDFLARE_API_URL}/zones/${zoneId}/email/routing/rules/${ruleId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY!}`,
        "X-Auth-Email": process.env.CLOUDFLARE_API_EMAIL!,
        "X-Auth-Key": process.env.CLOUDFLARE_GLOBAL_KEY!,
      },
    }
  );

  const data = await response.json();
  return data.success;
}
