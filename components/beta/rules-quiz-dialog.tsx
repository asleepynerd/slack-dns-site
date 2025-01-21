"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const BETA_RULES = [
  {
    title: "Beta Testing Phase",
    content:
      "This service is in beta testing. Features may break or change without notice.",
  },
  {
    title: "Data Persistence",
    content: "Emails and data may be deleted or reset during the beta period.",
  },
  {
    title: "Reporting Issues",
    content:
      "Please report any bugs or issues you encounter in #free-subdomains.",
  },
  {
    title: "Usage Guidelines",
    content:
      "Do not use this email for critical communications during the beta period.",
  },
];

const QUIZ_QUESTIONS = [
  {
    question: "This service is in beta testing and:",
    options: [
      "Is guaranteed to work perfectly",
      "May have features break or change without notice",
      "Will never have any issues",
    ],
    correctAnswer: 1,
  },
  {
    question: "During the beta period:",
    options: [
      "Your emails are guaranteed to be preserved forever",
      "You should use this for all your important communications",
      "Emails and data may be deleted or reset",
    ],
    correctAnswer: 2,
  },
];

interface RulesQuizDialogProps {
  onComplete: () => void;
}

export function RulesQuizDialog({ onComplete }: RulesQuizDialogProps) {
  const [open, setOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState<"rules" | "quiz">("rules");
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const handleQuizSubmit = async () => {
    if (answers.length !== QUIZ_QUESTIONS.length) {
      toast({
        title: "Error",
        description: "Please answer all questions",
        variant: "destructive",
      });
      return;
    }

    const allCorrect = answers.every(
      (answer, index) => answer === QUIZ_QUESTIONS[index].correctAnswer
    );

    if (allCorrect) {
      setLoading(true);
      try {
        const response = await fetch("/api/whitelist/quiz", {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to save quiz completion");
        }

        toast({
          title: "Success",
          description: "You've completed the beta rules quiz!",
        });
        setOpen(false);
        onComplete();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save quiz completion",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    } else {
      toast({
        title: "Incorrect Answers",
        description: "Please review the rules and try again",
        variant: "destructive",
      });
      setCurrentStep("rules");
      setAnswers([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Beta Testing Rules</DialogTitle>
          <DialogDescription>
            {currentStep === "rules"
              ? "Please read these rules carefully before proceeding"
              : "Please answer these questions about the beta rules"}
          </DialogDescription>
        </DialogHeader>

        {currentStep === "rules" ? (
          <div className="space-y-6">
            {BETA_RULES.map((rule, index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-medium">{rule.title}</h3>
                <p className="text-sm text-zinc-400">{rule.content}</p>
              </div>
            ))}
            <Button onClick={() => setCurrentStep("quiz")}>
              Continue to Quiz
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {QUIZ_QUESTIONS.map((q, qIndex) => (
              <div key={qIndex} className="space-y-3">
                <Label>{q.question}</Label>
                <RadioGroup
                  value={answers[qIndex]?.toString()}
                  onValueChange={(value) => {
                    const newAnswers = [...answers];
                    newAnswers[qIndex] = parseInt(value);
                    setAnswers(newAnswers);
                  }}
                >
                  {q.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={oIndex.toString()}
                        id={`q${qIndex}-o${oIndex}`}
                      />
                      <Label htmlFor={`q${qIndex}-o${oIndex}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
            <Button onClick={handleQuizSubmit}>Submit Quiz</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
