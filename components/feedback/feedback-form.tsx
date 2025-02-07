"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FeedbackForm() {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [hasGivenFeedback, setHasGivenFeedback] = useState(false);

  useEffect(() => {
    const checkFeedbackStatus = async () => {
      try {
        const response = await fetch("/api/feedback/check");
        const { hasGivenFeedback: dbFeedback } = await response.json();
        setHasGivenFeedback(dbFeedback);
      } catch (error) {
        console.error("Error checking feedback status:", error);
      }
    };

    checkFeedbackStatus();
  }, []);

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedback,
          rating,
          path: "/feedback",
        }),
      });

      if (response.ok) {
        toast({
          title: "Thank you!",
          description: "Your feedback has been submitted.",
        });
        setHasGivenFeedback(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive",
      });
    }
  };

  if (hasGivenFeedback) {
    return null;
  }

  return (
    <Card className="border border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <CardTitle>Submit Feedback</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <Button
              key={value}
              variant={rating === value ? "default" : "ghost"}
              size="sm"
              onClick={() => setRating(value)}
              className="p-2"
            >
              <Star
                className={`h-6 w-6 ${
                  rating >= value ? "fill-current" : "fill-none"
                }`}
              />
            </Button>
          ))}
        </div>
        <Textarea
          placeholder="Tell us what you think about the platform..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={!rating || !feedback}>
            Submit Feedback
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 