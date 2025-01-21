"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageActions } from "./message-actions";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { format } from "date-fns";
import { Reply, Forward } from "lucide-react";
import { ComposeMessage } from "./compose-message";

interface MessageViewDialogProps {
  message: {
    _id: string;
    subject: string;
    from: string;
    to: string;
    body: string;
    html?: string;
    createdAt: string;
    inboxId: string;
    attachments?: Array<{
      filename: string;
      url: string;
      contentType: string;
    }>;
  } | null;
  inFolder: "inbox" | "sent" | "junk" | "deleted" | "drafts";
  onClose: () => void;
  onAction: () => void;
}

export function MessageViewDialog({
  message,
  inFolder,
  onClose,
  onAction,
}: MessageViewDialogProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [showReply, setShowReply] = useState(false);
  const [showForward, setShowForward] = useState(false);

  if (!message) return null;

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const themeStyles =
    theme === "light"
      ? "bg-white text-black prose-p:text-gray-700 prose-headings:text-black"
      : "bg-zinc-950 text-zinc-100 prose-invert";

  return (
    <>
      <Dialog open={!!message} onOpenChange={onClose}>
        <DialogContent
          className={`max-w-3xl h-[80vh] flex flex-col ${themeStyles}`}
        >
          <DialogHeader className="flex-shrink-0">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-xl mb-2">
                  {message.subject}
                </DialogTitle>
                <div
                  className={`text-sm ${
                    theme === "light" ? "text-gray-600" : "text-zinc-400"
                  } space-y-1`}
                >
                  <div>From: {message.from}</div>
                  <div>To: {message.to}</div>
                  <div>Date: {format(new Date(message.createdAt), "PPp")}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReply(true)}
                >
                  <Reply className="w-4 h-4 mr-2" />
                  Reply
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForward(true)}
                >
                  <Forward className="w-4 h-4 mr-2" />
                  Forward
                </Button>
                <ThemeToggle theme={theme} onToggle={toggleTheme} />
                <MessageActions
                  messageId={message._id}
                  inFolder={inFolder}
                  onAction={() => {
                    onAction();
                    onClose();
                  }}
                />
              </div>
            </div>
          </DialogHeader>

          <div
            className={`flex-grow overflow-auto mt-4 ${
              theme === "light" ? "text-gray-700" : "text-zinc-300"
            }`}
          >
            {message.html ? (
              <div
                dangerouslySetInnerHTML={{ __html: message.html }}
                className={`prose max-w-none ${
                  theme === "light"
                    ? "[&_*]:text-gray-700 [&_a]:text-blue-600"
                    : "[&_*]:text-zinc-300 [&_a]:text-blue-400"
                } [&_a]:underline`}
              />
            ) : (
              <div className="whitespace-pre-wrap">{message.body}</div>
            )}
          </div>

          {message.attachments && message.attachments.length > 0 && (
            <div
              className={`flex-shrink-0 border-t ${
                theme === "light" ? "border-gray-200" : "border-zinc-800"
              } pt-4 mt-4`}
            >
              <h4 className="text-sm font-medium mb-2">Attachments</h4>
              <div className="flex flex-wrap gap-2">
                {message.attachments.map((attachment) => (
                  <Button
                    key={attachment.url}
                    variant={theme === "light" ? "outline" : "secondary"}
                    size="sm"
                    asChild
                  >
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {attachment.filename}
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {showReply && (
        <ComposeMessage
          fromEmail={message.to}
          inboxId={message.inboxId}
          replyTo={{
            to: message.from,
            subject: message.subject,
            body: message.body,
          }}
          onClose={() => setShowReply(false)}
        />
      )}

      {showForward && (
        <ComposeMessage
          fromEmail={message.to}
          inboxId={message.inboxId}
          replyTo={{
            to: "",
            subject: `Fwd: ${message.subject}`,
            body: message.body,
          }}
          onClose={() => setShowForward(false)}
        />
      )}
    </>
  );
}
