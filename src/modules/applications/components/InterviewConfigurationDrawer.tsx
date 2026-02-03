/**
 * Interview Configuration Drawer
 * Allows admins to configure interview settings for a job round
 */

import { useState, useEffect } from "react";
import { FormDrawer } from "@/shared/components/ui/form-drawer";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { toast } from "sonner";
import { Save, UserPlus, Clock, Video } from "lucide-react";
import { jobRoundService } from "@/shared/lib/jobRoundService";

interface InterviewConfigurationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  roundId: string;
  roundName: string;
  onSuccess?: () => void;
}

export function InterviewConfigurationDrawer({
  open,
  onOpenChange,
  jobId,
  roundId,
  roundName,
  onSuccess,
}: InterviewConfigurationDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Configuration state
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [interviewType, setInterviewType] = useState<string>("VIDEO");
  const [requireScorecard, setRequireScorecard] = useState(true);
  const [instructions, setInstructions] = useState("");
  const [allowSelfScheduling, setAllowSelfScheduling] = useState(false);

  // Load existing configuration (Mock for now as backend might not have specific endpoint yet)
  useEffect(() => {
    if (open && jobId && roundId) {
      loadConfiguration();
    }
  }, [open, jobId, roundId]);

  const loadConfiguration = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from a specific interview config endpoint
      // For now, we'll simulate loading with potential defaults/mock data
      // const response = await jobRoundService.getRoundDetails(jobId, roundId);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Defaults
      setDurationMinutes(60);
      setInterviewType("VIDEO");
      setRequireScorecard(true);
      setInstructions("");
      setAllowSelfScheduling(false);
      
    } catch (error) {
      console.error("Failed to load interview configuration:", error);
      toast.error("Failed to load configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const config = {
        durationMinutes,
        interviewType,
        requireScorecard,
        instructions,
        allowSelfScheduling,
      };

      console.log("Saving interview config for round", roundId, config);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Here we would call the actual update endpoint
      // await jobRoundService.updateRound(jobId, roundId, { metadata: config });

      toast.success("Interview configuration saved");
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save interview configuration:", error);
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={`Configure Interview: ${roundName}`}
      description="Set up interview duration, type, and requirements"
      width="xl"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading configuration...</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interview Logistics</CardTitle>
              <CardDescription>Default settings for interviews in this round</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Default Duration</Label>
                  <Select 
                    value={durationMinutes.toString()} 
                    onValueChange={(val) => setDurationMinutes(parseInt(val))}
                  >
                    <SelectTrigger id="duration">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Default Type</Label>
                  <Select 
                    value={interviewType} 
                    onValueChange={setInterviewType}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIDEO">Video Call</SelectItem>
                      <SelectItem value="PHONE">Phone Call</SelectItem>
                      <SelectItem value="IN_PERSON">In-Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label htmlFor="self-scheduling">Allow Self-Scheduling</Label>
                  <p className="text-sm text-muted-foreground">
                    Candidates can select their own slots from available times
                  </p>
                </div>
                <Switch
                  id="self-scheduling"
                  checked={allowSelfScheduling}
                  onCheckedChange={setAllowSelfScheduling}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Evaluation & Instructions</CardTitle>
              <CardDescription>Guidelines for interviewers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="scorecard">Require Scorecard</Label>
                  <p className="text-sm text-muted-foreground">
                    Interviewers must submit a scorecard feedback
                  </p>
                </div>
                <Switch
                  id="scorecard"
                  checked={requireScorecard}
                  onCheckedChange={setRequireScorecard}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instructions">Interviewer Instructions</Label>
                <Textarea
                  id="instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Enter guidelines, key competencies to assess, or question bank links..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-background pb-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </div>
      )}
    </FormDrawer>
  );
}
