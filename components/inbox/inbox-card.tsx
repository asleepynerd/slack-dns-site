import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface InboxCardProps {
  inbox: {
    _id: string;
    email: string;
    createdAt: string;
    active: boolean;
  };
  onDeleted: () => void;
}

export function InboxCard({ inbox, onDeleted }: InboxCardProps) {
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/inboxes/${inbox._id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        onDeleted();
      }
    } catch (error) {
      console.error("Failed to delete inbox:", error);
    }
  };

  return (
    <Card className="border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg text-zinc-100">{inbox.email}</h3>
          <Badge variant={inbox.active ? "default" : "secondary"}>
            {inbox.active ? "Active" : "Inactive"}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="hover:bg-red-500/20 hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end">
          <Link href={`/inbox/${inbox._id}`}>
            <Button variant="outline" size="sm">
              <Mail className="mr-2 h-4 w-4" />
              Open Inbox
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
