import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { saveFeedback360 } from "@/shared/lib/performanceStorage";
import { toast } from "@/hooks/use-toast";
import type { Feedback360, FeedbackProvider } from "@/types/performance";

interface Feedback360RequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface FeedbackQuestion {
  id: string;
  question: string;
}

interface ProviderInput {
  id: string;
  name: string;
  email: string;
  relationship: string;
}

export function Feedback360RequestDialog({
  open,
  onOpenChange,
  onSuccess,
}: Feedback360RequestDialogProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [reviewCycle, setReviewCycle] = useState("");
  const [dueDate, setDueDate] = useState<Date>();
  const [providers, setProviders] = useState<ProviderInput[]>([
    { id: "1", name: "", email: "", relationship: "peer" }
  ]);
  const [questions, setQuestions] = useState<FeedbackQuestion[]>([
    { id: "1", question: "" }
  ]);
  const [loading, setLoading] = useState(false);

  const handleAddProvider = () => {
    setProviders([
      ...providers,
      { 
        id: Date.now().toString(), 
        name: "", 
        email: "", 
        relationship: "peer"
      }
    ]);
  };

  const handleRemoveProvider = (id: string) => {
    if (providers.length > 1) {
      setProviders(providers.filter(p => p.id !== id));
    }
  };

  const handleProviderChange = (id: string, field: keyof ProviderInput, value: string) => {
    setProviders(providers.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { id: Date.now().toString(), question: "" }
    ]);
  };

  const handleRemoveQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const handleQuestionChange = (id: string, value: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, question: value } : q
    ));
  };

  const handleSubmit = async () => {
    // Validation
    if (!employeeId || !employeeName || !reviewCycle || !dueDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const invalidProviders = providers.some(p => !p.name || !p.email || !p.relationship);
    if (invalidProviders) {
      toast({
        title: "Invalid Providers",
        description: "Please complete all provider information.",
        variant: "destructive",
      });
      return;
    }

    const invalidQuestions = questions.some(q => !q.question.trim());
    if (invalidQuestions) {
      toast({
        title: "Invalid Questions",
        description: "Please fill in all feedback questions.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const feedbackRequest: Feedback360 = {
        id: `fb360-${Date.now()}`,
        employeeId,
        employeeName,
        reviewCycle,
        status: "in-progress",
        requestedBy: "user-1",
        requestedByName: "Current User",
        dueDate: dueDate.toISOString(),
        createdAt: new Date().toISOString(),
        providers: providers.map((p, index) => ({
          id: `provider-${Date.now()}-${index}`,
          providerId: `pid-${Date.now()}-${index}`,
          providerName: p.name,
          relationship: p.relationship,
          email: p.email,
          status: "pending" as const,
        })),
        questions: questions.map((q, index) => ({
          id: `question-${Date.now()}-${index}`,
          question: q.question,
        })),
      };

      saveFeedback360(feedbackRequest);

      toast({
        title: "Feedback Request Sent",
        description: `360 feedback requests sent to ${providers.length} reviewers.`,
      });

      // Reset form
      setEmployeeId("");
      setEmployeeName("");
      setReviewCycle("");
      setDueDate(undefined);
      setProviders([{ id: "1", name: "", email: "", relationship: "peer" }]);
      setQuestions([{ id: "1", question: "" }]);

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create feedback request.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request 360° Feedback</DialogTitle>
          <DialogDescription>
            Select reviewers and customize feedback questions for a comprehensive performance review.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Employee Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Employee Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID *</Label>
                <Input
                  id="employeeId"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g., EMP001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeName">Employee Name *</Label>
                <Input
                  id="employeeName"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="e.g., John Doe"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reviewCycle">Review Cycle *</Label>
                <Input
                  id="reviewCycle"
                  value={reviewCycle}
                  onChange={(e) => setReviewCycle(e.target.value)}
                  placeholder="e.g., Q1 2024"
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Feedback Providers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Feedback Providers</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddProvider}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Reviewer
              </Button>
            </div>
            <div className="space-y-3">
              {providers.map((provider, index) => (
                <div key={provider.id} className="flex gap-2 items-start p-3 border rounded-lg">
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Name *"
                        value={provider.name}
                        onChange={(e) => handleProviderChange(provider.id, "name", e.target.value)}
                      />
                      <Input
                        placeholder="Email *"
                        type="email"
                        value={provider.email}
                        onChange={(e) => handleProviderChange(provider.id, "email", e.target.value)}
                      />
                      <Select
                        value={provider.relationship}
                        onValueChange={(value) => handleProviderChange(provider.id, "relationship", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Relationship *" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="peer">Peer</SelectItem>
                          <SelectItem value="direct-report">Direct Report</SelectItem>
                          <SelectItem value="client">Client</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {providers.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveProvider(provider.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Feedback Questions</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddQuestion}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
            <div className="space-y-3">
              {questions.map((question, index) => (
                <div key={question.id} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Textarea
                      placeholder={`Question ${index + 1} *`}
                      value={question.question}
                      onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                      rows={2}
                    />
                  </div>
                  {questions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveQuestion(question.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Sending..." : "Send Requests"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
