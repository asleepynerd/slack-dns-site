"use client";

import { Button } from "@/components/ui/button";
import { Inbox, Send, Trash2, Archive, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderNavProps {
  currentFolder: "inbox" | "sent" | "junk" | "deleted" | "drafts";
  onFolderChange: (
    folder: "inbox" | "sent" | "junk" | "deleted" | "drafts"
  ) => void;
  counts: {
    inbox: number;
    sent: number;
    junk: number;
    deleted: number;
    drafts: number;
  };
}

export function FolderNav({
  currentFolder,
  onFolderChange,
  counts,
}: FolderNavProps) {
  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start",
          currentFolder === "inbox" && "bg-zinc-800/50"
        )}
        onClick={() => onFolderChange("inbox")}
      >
        <Inbox className="mr-2 h-4 w-4" />
        Inbox
        {counts.inbox > 0 && (
          <span className="ml-auto bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs">
            {counts.inbox}
          </span>
        )}
      </Button>

      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start",
          currentFolder === "sent" && "bg-zinc-800/50"
        )}
        onClick={() => onFolderChange("sent")}
      >
        <Send className="mr-2 h-4 w-4" />
        Sent
        {counts.sent > 0 && (
          <span className="ml-auto text-zinc-500 text-sm">{counts.sent}</span>
        )}
      </Button>

      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start",
          currentFolder === "junk" && "bg-zinc-800/50"
        )}
        onClick={() => onFolderChange("junk")}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Junk
        {counts.junk > 0 && (
          <span className="ml-auto text-zinc-500 text-sm">{counts.junk}</span>
        )}
      </Button>

      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start",
          currentFolder === "deleted" && "bg-zinc-800/50"
        )}
        onClick={() => onFolderChange("deleted")}
      >
        <Archive className="mr-2 h-4 w-4" />
        Deleted
        {counts.deleted > 0 && (
          <span className="ml-auto text-zinc-500 text-sm">
            {counts.deleted}
          </span>
        )}
      </Button>

      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start",
          currentFolder === "drafts" && "bg-zinc-800/50"
        )}
        onClick={() => onFolderChange("drafts")}
      >
        <File className="mr-2 h-4 w-4" />
        Drafts
        {counts.drafts > 0 && (
          <span className="ml-auto text-zinc-500 text-sm">{counts.drafts}</span>
        )}
      </Button>
    </div>
  );
}
