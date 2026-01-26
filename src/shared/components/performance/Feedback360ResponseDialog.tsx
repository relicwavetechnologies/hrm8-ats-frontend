import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Card } from "@/shared/components/ui/card";
import { toast } from "sonner";
import { Feedback360, FeedbackResponse } from "@/types/performance";
import { saveFeedback360 } from "@/shared/lib/performanceStorage";
import { Star } from "lucide-react";

interface Feedback360ResponseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedback: Feedback360;
  providerId: string; // The ID of the person providing the feedback
  providerName: string;
}

interface QuestionResponse {
  questionId: string;
  rating: number;
  comment: string;
}

export function Feedback360ResponseDialog({
  open,
  onOpenChange,
  feedback,
  providerId,
  providerName,
}: Feedback360ResponseDialogProps) {
  const [responses, setResponses] = useState<QuestionResponse[]>(
    feedback.questions.map(q => ({
      questionId: q.id,
      rating: 0,
      comment: "",
    }))
  );
  const [loading, setLoading] = useState(false);

  const handleRatingChange = (questionId: string, rating: number) => {
    setResponses(prev =>
      prev.map(r =>
        r.questionId === questionId ? { ...r, rating } : r
      )
    );
  };

  const handleCommentChange = (questionId: string, comment: string) => {
    setResponses(prev =>
      prev.map(r =>
        r.questionId === questionId ? { ...r, comment } : r
      )
    );
  };

  const handleSubmit = async () => {
    // Validate that all questions have ratings
    const missingRatings = responses.filter(r => r.rating === 0);
    if (missingRatings.length > 0) {
      toast.error("Please provide ratings for all questions");
      return;
    }

    setLoading(true);

    try {
      // Create feedback responses
      const newResponses: FeedbackResponse[] = responses.map(r => {
        const question = feedback.questions.find(q => q.id === r.questionId);
        return {
          id: `${providerId}-${r.questionId}-${Date.now()}`,
          providerId,
          providerName,
          relationship: feedback.providers.find(p => p.id === providerId)?.relationship || "Colleague",
          questionId: r.questionId,
          question: question?.question || "",
          rating: r.rating,
          comment: r.comment,
          submittedAt: new Date().toISOString(),
        };
      });

      // Update the feedback with new responses
      const updatedFeedback: Feedback360 = {
        ...feedback,
        responses: [...(feedback.responses || []), ...newResponses],
        status: feedback.responses && feedback.responses.length + newResponses.length >= feedback.providers.length * feedback.questions.length
          ? "completed"
          : "in-progress",
      };

      saveFeedback360(updatedFeedback);

      toast.success("Feedback submitted successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>360° Feedback Response</DialogTitle>
          <DialogDescription>
            Provide feedback for {feedback.employeeName} - {feedback.reviewCycle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Employee:</span>
                <span className="ml-2 font-medium">{feedback.employeeName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Review Cycle:</span>
                <span className="ml-2 font-medium">{feedback.reviewCycle}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Your Name:</span>
                <span className="ml-2 font-medium">{providerName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Due Date:</span>
                <span className="ml-2 font-medium">
                  {new Date(feedback.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Rate and Comment on Each Area</h3>
            {feedback.questions.map((question, index) => {
              const response = responses.find(r => r.questionId === question.id);
              return (
                <Card key={question.id} className="p-4 space-y-4">
                  <div>
                    <Label className="text-base font-medium">
                      {index + 1}. {question.question}
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Rating (1-5)</Label>
                    <RadioGroup
                      value={response?.rating.toString() || "0"}
                      onValueChange={(value) => handleRatingChange(question.id, parseInt(value))}
                      className="flex gap-4"
                    >
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <div key={rating} className="flex items-center space-x-2">
                          <RadioGroupItem value={rating.toString()} id={`${question.id}-${rating}`} />
                          <Label
                            htmlFor={`${question.id}-${rating}`}
                            className="flex items-center gap-1 cursor-pointer"
                          >
                            {rating}
                            <Star className="h-4 w-4 fill-primary text-primary" />
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`comment-${question.id}`}>Comments</Label>
                    <Textarea
                      id={`comment-${question.id}`}
                      placeholder="Provide specific examples and constructive feedback..."
                      value={response?.comment || ""}
                      onChange={(e) => handleCommentChange(question.id, e.target.value)}
                      rows={4}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
