"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Cookies from "js-cookie";

export function FeedbackPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [hasGivenFeedback, setHasGivenFeedback] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkFeedbackStatus = async () => {
      try {
        const response = await fetch("/api/feedback/check");
        const { hasGivenFeedback: dbFeedback } = await response.json();

        if (dbFeedback) {
          setHasGivenFeedback(true);
          return;
        }

        const maybeLater = Cookies.get("feedbackMaybeLater");
        if (!maybeLater && !pathname.includes("/auth") && pathname !== "/") {
          const timer = setTimeout(() => {
            setIsOpen(true);
          }, 30000);

          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error("Error checking feedback status:", error);
      }
    };

    checkFeedbackStatus();
  }, [pathname]);

  const handleMaybeLater = () => {
    Cookies.set("feedbackMaybeLater", "true", { expires: 7 });
    setIsOpen(false);
  };

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
          path: pathname,
        }),
      });

      if (response.ok) {
        toast({
          title: "Thank you!",
          description: "Your feedback has been submitted.",
        });
        setIsOpen(false);
        setHasGivenFeedback(true);
        Cookies.remove("feedbackMaybeLater");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive",
      });
    }
  };

  if (hasGivenFeedback || pathname.includes("/auth") || pathname === "/" || pathname === "/feedback") {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Help Me Improve!</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
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
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleMaybeLater}>
              Maybe Later
            </Button>
            <Button onClick={handleSubmit} disabled={!rating || !feedback}>
              Submit Feedback
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
