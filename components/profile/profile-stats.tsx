"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Inbox,
  MessageSquare,
  Star,
  Globe,
  Mail,
  Link2,
  FileBox,
} from "lucide-react";

interface Stats {
  inboxCount: number;
  messageCount: number;
  averageFeedback?: number;
  domainCount: number;
  emailForwardingCount: number;
  linkCount: number;
  cdnFileCount: number;
}

export function ProfileStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/profile/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center text-zinc-500">Loading stats...</div>;
  }

  if (!stats) return null;

  const statItems = [
    {
      icon: <Globe className="h-6 w-6 text-blue-500" />,
      label: "Subdomains",
      value: stats.domainCount,
    },
    {
      icon: <Mail className="h-6 w-6 text-purple-500" />,
      label: "Email Forwards",
      value: stats.emailForwardingCount,
    },
    {
      icon: <Inbox className="h-6 w-6 text-indigo-500" />,
      label: "Active Inboxes",
      value: stats.inboxCount,
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-green-500" />,
      label: "Total Messages",
      value: stats.messageCount,
    },
    {
      icon: <Link2 className="h-6 w-6 text-pink-500" />,
      label: "Short Links",
      value: stats.linkCount,
    },
    {
      icon: <FileBox className="h-6 w-6 text-orange-500" />,
      label: "CDN Files",
      value: stats.cdnFileCount,
    },
    {
      icon: <Star className="h-6 w-6 text-yellow-500" />,
      label: "Avg. Feedback",
      value: stats.averageFeedback?.toFixed(1) || "N/A",
    },
  ];

  return (
    <Card className="border border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <CardTitle>Your Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {statItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors"
            >
              {item.icon}
              <div>
                <p className="text-sm text-zinc-400">{item.label}</p>
                <p className="text-2xl font-semibold">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
