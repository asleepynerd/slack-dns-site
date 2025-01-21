"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, Archive, MailX } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { FolderType } from "@/lib/types";

interface MessageActionsProps {
  messageId: string;
  inFolder: FolderType;
  onAction: () => void;
}

export function MessageActions({
  messageId,
  inFolder,
  onAction,
}: MessageActionsProps) {
  const handleAction = async (
    action: "delete" | "restore" | "permanent-delete"
  ) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) throw new Error();

      toast({
        title: "Success",
        description:
          action === "restore" ? "Message restored" : "Message deleted",
      });
      onAction();
    } catch {
      toast({
        title: "Error",
        description: "Failed to perform action",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        {inFolder === "deleted" ? (
          <>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleAction("restore");
              }}
            >
              <Archive className="mr-2 h-4 w-4" />
              Restore
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleAction("permanent-delete");
              }}
              className="text-red-500 focus:text-red-500"
            >
              <MailX className="mr-2 h-4 w-4" />
              Delete Permanently
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleAction("delete");
            }}
            className="text-red-500 focus:text-red-500"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Move to Trash
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
