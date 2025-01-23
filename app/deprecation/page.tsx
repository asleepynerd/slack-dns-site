"use client";

import { Navbar } from "@/components/layout/navbar";
import { ExternalLink, AlertTriangle, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SHUTDOWN_DATE = "March 23rd, 2025";

export default function DeprecationPage() {
  const handleExportData = async () => {
    try {
      const response = await fetch("/api/export-data");
      if (!response.ok) {
        throw new Error("Failed to export data");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-domains-backup.json";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Failed to export data:", error);
      toast.error("Failed to export data. Please try again later.");
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-b from-zinc-900 to-black">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent blur-3xl" />
      </div>

      <div className="relative">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="flex items-center justify-center space-x-3">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <h1 className="text-4xl font-bold text-white">
                Service Deprecation Notice
              </h1>
            </div>

            <div className="space-y-6 text-lg text-zinc-400">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="font-medium text-red-400">
                  This service is being deprecated and will be fully shut down
                  on {SHUTDOWN_DATE}.
                </p>
              </div>

              <p className="text-zinc-300">
                Reasoning? I'm not sure. I haven't been doing well lately, and
                I'm not sure if I'll be able to keep this up. So I'm deprecating
                it, in hopes that maybe later on i'll bring it back up again, or
                someone else will take over.
              </p>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 text-left">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Timeline & Important Information:
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                    <p>
                      On <span className="text-red-400">{SHUTDOWN_DATE}</span>,
                      all DNS records, database entries, and associated services
                      will be permanently deleted.
                    </p>
                  </div>
                  <div className="border-t border-zinc-800 my-4" />
                  <div>
                    <h3 className="text-white font-medium mb-2">Until then:</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>All existing subdomains will continue to work</li>
                      <li>Link shortener URLs will remain functional</li>
                      <li>CDN files will stay accessible</li>
                      <li>Email forwarding will continue to operate</li>
                      <li className="text-yellow-400">
                        However, you won't be able to edit or delete any of
                        these services
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Export Your Data
                </h2>
                <p className="mb-6 text-sm text-center">
                  Please download a backup of your data before {SHUTDOWN_DATE}.
                  This includes your:
                  <br />
                  DNS records, email forwarding routes, link shortcuts, inboxes,
                  and CDN file listings.
                </p>
                <div className="flex justify-center">
                  <Button
                    onClick={handleExportData}
                    className="bg-blue-500 hover:bg-blue-600 text-white flex items-center space-x-2 px-6 py-2"
                    size="lg"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Your Data</span>
                  </Button>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                <p className="text-zinc-300">
                  Thank you for using my service. If you have any questions or
                  concerns, please reach out to me on the{" "}
                  <a
                    href="https://hackclub.slack.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 inline-flex items-center"
                  >
                    Hack Club Slack
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
