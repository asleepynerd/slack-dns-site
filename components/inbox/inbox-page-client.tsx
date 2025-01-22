"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { InboxList } from "@/components/inbox/inbox-list";
import { RulesQuizDialog } from "@/components/beta/rules-quiz-dialog";

export function InboxPageClient() {
  const [showRules, setShowRules] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkQuizStatus() {
      try {
        const response = await fetch("/api/whitelist/quiz");
        if (response.ok) {
          const data = await response.json();
          setShowRules(!data.completed);
        }
      } catch (error) {
        console.error("Failed to check quiz status:", error);
      } finally {
        setLoading(false);
      }
    }

    checkQuizStatus();
  }, []);

  if (loading) {
    return null; 
  }

  if (showRules) {
    return <RulesQuizDialog onComplete={() => setShowRules(false)} />;
  }

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-b from-zinc-900 to-black">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent blur-3xl" />
      </div>

      <div className="relative">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white">Your Inboxes</h2>
            <p className="mt-4 text-lg text-zinc-400">
              Manage your @hackclubber.dev email addresses
            </p>
          </div>
          <InboxList />
        </main>
      </div>
    </div>
  );
} 