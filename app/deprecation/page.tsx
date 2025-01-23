import { Navbar } from "@/components/layout/navbar";
import { ExternalLink, AlertTriangle } from "lucide-react";

export default function DeprecationPage() {
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
                  This service is being deprecated and will be shut down soon.
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
                  What This Means For You:
                </h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>All existing subdomains will continue to work</li>
                  <li>Link shortener URLs will remain functional</li>
                  <li>CDN files will stay accessible</li>
                  <li>Email forwarding will continue to operate</li>
                  <li className="text-yellow-400">
                    However, you won't be able to edit or delete any of these
                    services
                  </li>
                </ul>
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
