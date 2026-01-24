import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { useToast } from "@/shared/hooks/use-toast";
import { getExitInterviews, saveExitInterview } from "@/shared/lib/offboardingStorage";
import { getOffboardingWorkflows } from "@/shared/lib/offboardingStorage";
import { format } from "date-fns";

interface ExitInterviewFormProps {
  workflowId: string;
  onUpdate?: () => void;
}

export function ExitInterviewForm({ workflowId, onUpdate }: ExitInterviewFormProps) {
  const { toast } = useToast();
  const workflows = getOffboardingWorkflows();
  const workflow = workflows.find(w => w.id === workflowId);
  const existingInterview = getExitInterviews().find(i => i.offboardingWorkflowId === workflowId);

  const [formData, setFormData] = useState({
    reasonForLeaving: existingInterview?.reasonForLeaving || '',
    satisfactionLevel: existingInterview?.satisfactionLevel || 3,
    wouldRecommend: existingInterview?.wouldRecommend ?? true,
    managementRating: existingInterview?.managementRating || 3,
    workEnvironmentRating: existingInterview?.workEnvironmentRating || 3,
    compensationRating: existingInterview?.compensationRating || 3,
    careerGrowthRating: existingInterview?.careerGrowthRating || 3,
    suggestions: existingInterview?.suggestions || '',
    concerns: existingInterview?.concerns || '',
    feedback: existingInterview?.feedback || '',
  });

  if (!workflow) return null;

  const handleSubmit = () => {
    saveExitInterview({
      offboardingWorkflowId: workflowId,
      employeeId: workflow.employeeId,
      employeeName: workflow.employeeName,
      interviewDate: new Date().toISOString(),
      interviewedBy: 'HR Manager',
      ...formData,
    });

    toast({
      title: "Exit Interview Saved",
      description: "Exit interview has been recorded successfully",
    });

    onUpdate?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exit Interview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {existingInterview ? (
          <div className="space-y-6">
            <div className="p-4 bg-accent rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Interview completed on</p>
              <p className="font-medium">
                {format(new Date(existingInterview.interviewDate), 'MMMM d, yyyy')}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                By {existingInterview.interviewedBy}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base">Reason for Leaving</Label>
                <p className="mt-2 text-sm">{existingInterview.reasonForLeaving}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-accent rounded-lg">
                  <p className="text-2xl font-bold">{existingInterview.satisfactionLevel}/5</p>
                  <p className="text-xs text-muted-foreground mt-1">Satisfaction</p>
                </div>
                <div className="text-center p-3 bg-accent rounded-lg">
                  <p className="text-2xl font-bold">{existingInterview.managementRating}/5</p>
                  <p className="text-xs text-muted-foreground mt-1">Management</p>
                </div>
                <div className="text-center p-3 bg-accent rounded-lg">
                  <p className="text-2xl font-bold">{existingInterview.workEnvironmentRating}/5</p>
                  <p className="text-xs text-muted-foreground mt-1">Environment</p>
                </div>
                <div className="text-center p-3 bg-accent rounded-lg">
                  <p className="text-2xl font-bold">{existingInterview.compensationRating}/5</p>
                  <p className="text-xs text-muted-foreground mt-1">Compensation</p>
                </div>
              </div>

              <div>
                <Label className="text-base">Would Recommend Company</Label>
                <p className="mt-2 text-sm font-medium">
                  {existingInterview.wouldRecommend ? 'Yes' : 'No'}
                </p>
              </div>

              {existingInterview.suggestions && (
                <div>
                  <Label className="text-base">Suggestions for Improvement</Label>
                  <p className="mt-2 text-sm">{existingInterview.suggestions}</p>
                </div>
              )}

              {existingInterview.concerns && (
                <div>
                  <Label className="text-base">Concerns</Label>
                  <p className="mt-2 text-sm">{existingInterview.concerns}</p>
                </div>
              )}

              {existingInterview.feedback && (
                <div>
                  <Label className="text-base">Additional Feedback</Label>
                  <p className="mt-2 text-sm">{existingInterview.feedback}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <Label htmlFor="reasonForLeaving">Reason for Leaving *</Label>
              <Textarea
                id="reasonForLeaving"
                value={formData.reasonForLeaving}
                onChange={(e) => setFormData({ ...formData, reasonForLeaving: e.target.value })}
                placeholder="Please describe the primary reason for leaving..."
                className="mt-2"
                rows={4}
              />
            </div>

            <div>
              <Label>Overall Satisfaction (1-5)</Label>
              <RadioGroup
                value={formData.satisfactionLevel.toString()}
                onValueChange={(value) => setFormData({ ...formData, satisfactionLevel: parseInt(value) })}
                className="flex gap-4 mt-2"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <div key={num} className="flex items-center space-x-2">
                    <RadioGroupItem value={num.toString()} id={`satisfaction-${num}`} />
                    <Label htmlFor={`satisfaction-${num}`}>{num}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label>Would you recommend this company?</Label>
              <RadioGroup
                value={formData.wouldRecommend ? 'true' : 'false'}
                onValueChange={(value) => setFormData({ ...formData, wouldRecommend: value === 'true' })}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="recommend-yes" />
                  <Label htmlFor="recommend-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="recommend-no" />
                  <Label htmlFor="recommend-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="suggestions">Suggestions for Improvement</Label>
              <Textarea
                id="suggestions"
                value={formData.suggestions}
                onChange={(e) => setFormData({ ...formData, suggestions: e.target.value })}
                placeholder="What could the company do better?"
                className="mt-2"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="concerns">Any Concerns</Label>
              <Textarea
                id="concerns"
                value={formData.concerns}
                onChange={(e) => setFormData({ ...formData, concerns: e.target.value })}
                placeholder="Were there any unresolved issues?"
                className="mt-2"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="feedback">Additional Feedback</Label>
              <Textarea
                id="feedback"
                value={formData.feedback}
                onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                placeholder="Any other comments or feedback..."
                className="mt-2"
                rows={3}
              />
            </div>

            <Button onClick={handleSubmit} className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              Submit Exit Interview
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
