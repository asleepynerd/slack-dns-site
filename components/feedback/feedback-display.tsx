"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

interface Feedback {
  _id: string;
  feedback: string;
  rating: number;
  createdAt: string;
  path: string;
}

export function FeedbackDisplay() {
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await fetch("/api/feedback/user");
        if (response.ok) {
          const data = await response.json();
          setFeedback(data);
        }
      } catch (error) {
        console.error("Error fetching feedback:", error);
      }
    };

    fetchFeedback();
  }, []);

  if (!feedback) {
    return null;
  }

  return (
    <Card className="border border-zinc-800 bg-zinc-900/50 mb-8">
      <CardHeader>
        <CardTitle>Your Feedback</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i < feedback.rating ? "fill-current text-yellow-500" : "text-zinc-600"
              }`}
            />
          ))}
        </div>
        <p className="text-zinc-300">{feedback.feedback}</p>
        <div className="text-sm text-zinc-500">
          Submitted on {new Date(feedback.createdAt).toLocaleDateString()}
          {feedback.path && ` • From ${feedback.path}`}
        </div>
      </CardContent>
    </Card>
  );
} 