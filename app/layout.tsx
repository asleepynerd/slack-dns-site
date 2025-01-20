import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Subdomains for hackclubbers",
  description: "Manage your subdomains with ease",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gradient-to-bl from-zinc-900 via-black to-zinc-900">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
