"use client";

import { useEffect, useState, useCallback } from "react";
import { FolderNav } from "./folder-nav";
import { MessageActions } from "./message-actions";
import { MessageViewDialog } from "./message-view-dialog";
import { MessageSearch } from "./message-search";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Trash2 } from "lucide-react";
import { Message, FolderType } from "@/lib/types";

function truncateText(text: string | undefined | null, maxLength: number) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

function formatDate(date: string | Date | undefined): string {
  if (!date) {
    const now = new Date().toLocaleString();
    console.warn("Missing date, using current time:", now);
    return now;
  }

  try {
    // If it's already a Date object
    if (date instanceof Date) {
      return date.toLocaleString();
    }

    // If it's a string, try to parse it
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      console.error("Invalid date string:", date);
      return new Date().toLocaleString(); // Fallback to current time
    }
    return parsedDate.toLocaleString();
  } catch (error) {
    console.error("Date formatting error:", error, "for date:", date);
    return new Date().toLocaleString(); // Fallback to current time
  }
}

export function MessageList({ inboxId }: { inboxId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<FolderType>("inbox");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchMessages = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setRefreshing(true);
        const response = await fetch(
          `/api/messages?inboxId=${inboxId}&folder=${currentFolder}`
        );
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [inboxId, currentFolder]
  );

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchMessages]);

  const getCounts = () => ({
    inbox: messages.filter((m) => !m.sent && !m.junk && !m.deleted).length,
    sent: messages.filter((m) => m.sent && !m.deleted).length,
    junk: messages.filter((m) => m.junk && !m.deleted).length,
    deleted: messages.filter((m) => m.deleted).length,
    drafts: 0,
  });

  const filteredMessages = messages.filter((message) => {
    if (currentFolder === "drafts") return false;
    if (currentFolder === "deleted") return message.deleted;

    return (
      !message.deleted &&
      (currentFolder === "sent"
        ? message.sent
        : currentFolder === "junk"
        ? message.junk
        : !message.sent && !message.junk)
    );
  });

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-1">
        <FolderNav
          currentFolder={currentFolder}
          onFolderChange={setCurrentFolder}
          counts={getCounts()}
        />
      </div>

      <div className="col-span-3 space-y-4">
        <div className="flex items-center justify-between">
          <MessageSearch onSearch={setSearchQuery} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchMessages()}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div>Loading messages...</div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-zinc-400">No messages found</div>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <div
                key={message._id}
                className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/50 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                onClick={() => setSelectedMessage(message)}
              >
                <div className="flex justify-between mb-2">
                  <div>
                    <div className="font-medium text-zinc-100">
                      {message.subject}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-zinc-400">
                        {currentFolder === "sent"
                          ? `To: ${message.to}`
                          : `From: ${message.from}`}
                      </div>
                      <div className="text-sm text-zinc-500">
                        {formatDate(message.receivedAt || message.createdAt)}
                      </div>
                    </div>
                  </div>
                  <MessageActions
                    messageId={message._id}
                    inFolder={currentFolder}
                    onAction={fetchMessages}
                  />
                </div>
                <div className="text-zinc-300 line-clamp-2">
                  {truncateText(message.body, 150)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MessageViewDialog
        message={selectedMessage}
        inFolder={currentFolder}
        onClose={() => setSelectedMessage(null)}
        onAction={fetchMessages}
      />

      {messageToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Delete Message</h2>
            <p>Are you sure you want to delete this message?</p>
            <div className="mt-4 space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setMessageToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setMessageToDelete(null);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
