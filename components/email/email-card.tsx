"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EmailForwarding {
  fromEmail: string;
  toEmail: string;
  domain: string;
  ruleId: string;
  status: "pending" | "active";
}

interface EmailCardProps {
  forwarding: EmailForwarding;
  onDelete: () => void;
}

export function EmailCard({ forwarding, onDelete }: EmailCardProps) {
  return (
    <Card className="border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg text-zinc-100">
            {forwarding.fromEmail}
          </h3>
          <Badge
            variant={forwarding.status === "active" ? "default" : "secondary"}
          >
            {forwarding.status === "active" ? "Active" : "Pending Verification"}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="hover:bg-red-500/20 hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-zinc-400">
          Forwarding to:{" "}
          <span className="text-zinc-100">{forwarding.toEmail}</span>
        </p>
      </CardContent>
    </Card>
  );
}
