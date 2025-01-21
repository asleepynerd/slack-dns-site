export type FolderType = "inbox" | "sent" | "junk" | "deleted" | "drafts";

export interface Message {
  _id: string;
  subject: string;
  from: string;
  to: string;
  body: string;
  html?: string;
  createdAt: string | Date;
  receivedAt: string | Date;
  inboxId: string;
  read: boolean;
  sent: boolean;
  junk: boolean;
  deleted: boolean;
  deletedAt?: string | Date;
  attachments?: Array<{
    filename: string;
    url: string;
    contentType: string;
  }>;
}
