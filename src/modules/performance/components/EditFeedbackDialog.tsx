import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { TeamMemberFeedback } from '@/shared/types/collaborativeFeedback';
import { updateFeedback } from '@/shared/lib/collaborativeFeedbackService';
import { useConflictDetection } from '@/shared/hooks/useConflictDetection';
import { ConflictResolutionDialog } from './ConflictResolutionDialog';
import { ConflictWarningBanner } from './ConflictWarningBanner';
import { ConflictResolution } from '@/shared/types/feedbackConflict';
import { toast } from '@/shared/hooks/use-toast';
import { Save, AlertCircle } from 'lucide-react';

interface EditFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedback: TeamMemberFeedback;
  onSaved: () => void;
}

export const EditFeedbackDialog: React.FC<EditFeedbackDialogProps> = ({
  open,
  onOpenChange,
  feedback,
  onSaved,
}) => {
  const [localFeedback, setLocalFeedback] = useState<TeamMemberFeedback>(feedback);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { conflicts, isChecking, checkForConflicts, clearConflicts } = useConflictDetection({
    localFeedback,
    currentUserId: 'current-user',
    onConflictDetected: (detectedConflicts) => {
      toast({
        title: '⚠️ Conflict Detected',
        description: `${detectedConflicts.length} conflict(s) found with remote changes`,
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    setLocalFeedback(feedback);
    setHasUnsavedChanges(false);
  }, [feedback]);

  const handleSave = async () => {
    // Check for conflicts before saving
    const { hasConflicts } = await checkForConflicts();

    if (hasConflicts) {
      setShowConflictDialog(true);
      return;
    }

    // No conflicts, save directly
    try {
      updateFeedback(localFeedback.id, localFeedback);
      toast({
        title: '✅ Feedback Updated',
        description: 'Your changes have been saved successfully',
      });
      setHasUnsavedChanges(false);
      onSaved();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: '❌ Save Failed',
        description: 'Failed to save changes. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleConflictResolve = (resolutions: ConflictResolution[]) => {
    // Apply resolutions to local feedback
    const resolved = { ...localFeedback };
    resolutions.forEach(resolution => {
      (resolved as any)[resolution.field] = resolution.chosenValue;
    });

    setLocalFeedback(resolved);
    
    // Save the resolved version
    try {
      updateFeedback(resolved.id, resolved);
      toast({
        title: '✅ Conflicts Resolved',
        description: 'Your changes have been merged and saved',
      });
      setHasUnsavedChanges(false);
      clearConflicts();
      setShowConflictDialog(false);
      onSaved();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: '❌ Save Failed',
        description: 'Failed to save resolved changes. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleChange = (field: keyof TeamMemberFeedback, value: any) => {
    setLocalFeedback(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Feedback</DialogTitle>
            <DialogDescription>
              Make changes to your feedback. Changes will be checked for conflicts before saving.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {conflicts.length > 0 && (
              <ConflictWarningBanner
                conflictCount={conflicts.length}
                onResolve={() => setShowConflictDialog(true)}
                onRefresh={() => {
                  setLocalFeedback(feedback);
                  clearConflicts();
                  setHasUnsavedChanges(false);
                }}
              />
            )}

            {/* Overall Score */}
            <div className="space-y-2">
              <Label htmlFor="overallScore">Overall Score (0-100)</Label>
              <Input
                id="overallScore"
                type="number"
                min="0"
                max="100"
                value={localFeedback.overallScore}
                onChange={(e) => handleChange('overallScore', parseInt(e.target.value))}
              />
            </div>

            {/* Recommendation */}
            <div className="space-y-2">
              <Label htmlFor="recommendation">Recommendation</Label>
              <Select
                value={localFeedback.recommendation}
                onValueChange={(value) => handleChange('recommendation', value)}
              >
                <SelectTrigger id="recommendation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strong-hire">Strong Hire</SelectItem>
                  <SelectItem value="hire">Hire</SelectItem>
                  <SelectItem value="maybe">Maybe</SelectItem>
                  <SelectItem value="no-hire">No Hire</SelectItem>
                  <SelectItem value="strong-no-hire">Strong No Hire</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Confidence */}
            <div className="space-y-2">
              <Label htmlFor="confidence">Confidence (1-5)</Label>
              <Input
                id="confidence"
                type="number"
                min="1"
                max="5"
                value={localFeedback.confidence}
                onChange={(e) => handleChange('confidence', parseInt(e.target.value))}
              />
            </div>

            {/* Comments Preview */}
            <div className="space-y-2">
              <Label>Comments ({localFeedback.comments.length})</Label>
              <div className="border rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                {localFeedback.comments.map((comment, index) => (
                  <div key={comment.id} className="text-sm">
                    <div className="flex gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {comment.type}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                You have unsaved changes
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isChecking || !hasUnsavedChanges}>
              {isChecking ? (
                <>Checking for conflicts...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConflictResolutionDialog
        open={showConflictDialog}
        onOpenChange={setShowConflictDialog}
        conflicts={conflicts}
        onResolve={handleConflictResolve}
        onCancel={() => {
          setShowConflictDialog(false);
          clearConflicts();
        }}
      />
    </>
  );
};
