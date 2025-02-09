"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export function ProfileInfo() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <Card className="border border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          {session.user.image && (
            <div className="relative h-20 w-20 rounded-full overflow-hidden">
              <Image
                src={session.user.image}
                alt={session.user.name || "Profile"}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div>
            <h3 className="text-xl font-semibold text-zinc-100">
              {session.user.name}
            </h3>
            <p className="text-zinc-400">{session.user.email}</p>
          </div>
        </div>
        <div className="pt-4 border-t border-zinc-800">
          <p className="text-sm text-zinc-500">Account created via Slack</p>
        </div>
      </CardContent>
    </Card>
  );
}
