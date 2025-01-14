export interface DNSTemplate {
  name: string;
  description: string;
  records: {
    type: string;
    data: any[];
  }[];
}

export const DNS_TEMPLATES: { [key: string]: DNSTemplate } = {
  "github-pages": {
    name: "GitHub Pages",
    description: "Set up GitHub Pages custom domain",
    records: [
      {
        type: "A",
        data: [
          { content: "185.199.108.153" },
          { content: "185.199.109.153" },
          { content: "185.199.110.153" },
          { content: "185.199.111.153" },
        ],
      },
    ],
  },
  vercel: {
    name: "Vercel",
    description: "Configure domain for Vercel deployments",
    records: [
      {
        type: "A",
        data: [{ content: "76.76.21.21" }],
      },
    ],
  },
  gmail: {
    name: "Gmail MX",
    description: "Set up Gmail MX records",
    records: [
      {
        type: "MX",
        data: [
          { priority: 1, content: "aspmx.l.google.com" },
          { priority: 5, content: "alt1.aspmx.l.google.com" },
          { priority: 5, content: "alt2.aspmx.l.google.com" },
          { priority: 10, content: "alt3.aspmx.l.google.com" },
          { priority: 10, content: "alt4.aspmx.l.google.com" },
        ],
      },
    ],
  },
  cloudflare: {
    name: "Cloudflare Email",
    description: "Set up Cloudflare Email Routing",
    records: [
      {
        type: "MX",
        data: [
          { priority: 13, content: "route1.mx.cloudflare.net" },
          { priority: 86, content: "route2.mx.cloudflare.net" },
          { priority: 44, content: "route3.mx.cloudflare.net" },
        ],
      },
    ],
  },
  custom: {
    name: "Custom",
    description: "Configure custom DNS records",
    records: [],
  },
};
