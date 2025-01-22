"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateLinkDialog } from "./create-link-dialog";
import { toast } from "@/hooks/use-toast";
import { Copy, ExternalLink } from "lucide-react";

interface Link {
  _id: string;
  shortCode: string;
  destination: string;
  createdAt: string;
  clicks: number;
  lastClickedAt?: string;
}

export function LinkList() {
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const fetchLinks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/links");
      if (!response.ok) throw new Error("Failed to fetch links");
      const data = await response.json();
      setLinks(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load links",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const copyToClipboard = async (shortCode: string) => {
    const shortUrl = `https://hackclubber.dev/${shortCode}`;
    await navigator.clipboard.writeText(shortUrl);
    toast({
      title: "Copied",
      description: "Short link copied to clipboard",
    });
  };

  if (isLoading) {
    return <div className="text-center mt-8">Loading links...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          Create New Link
        </Button>
      </div>

      <div className="space-y-4">
        {links.map((link) => (
          <div
            key={link._id}
            className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/50"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-zinc-100">
                  hackclubber.dev/{link.shortCode}
                </div>
                <div className="text-sm text-zinc-400 mt-1">
                  {link.destination}
                </div>
                <div className="text-sm text-zinc-500 mt-2">
                  {link.clicks} clicks • Created{" "}
                  {new Date(link.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(link.shortCode)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={`https://hackclubber.dev/${link.shortCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CreateLinkDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onLinkCreated={fetchLinks}
      />
    </div>
  );
}
