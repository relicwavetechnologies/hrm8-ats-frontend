import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/shared/components/ui/select";
import { X, UserPlus, Tag, Mail, Calendar, Archive, Trash2, ClipboardCheck } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { useState } from "react";

interface CandidateBulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkStageUpdate: (stageId: string) => void;
  onBulkTagAdd: (tags: string[]) => void;
  onBulkPriorityUpdate: (priority: 'high' | 'medium' | 'low') => void;
  onBulkArchive: () => void;
  onBulkDelete: () => void;
  onBulkEmail: () => void;
  onBulkScheduleInterview: () => void;
  onBulkAssessmentInvite: () => void;
}

export function CandidateBulkActionsToolbar({ 
  selectedCount, 
  onClearSelection, 
  onBulkStageUpdate,
  onBulkTagAdd,
  onBulkPriorityUpdate,
  onBulkArchive,
  onBulkDelete,
  onBulkEmail,
  onBulkScheduleInterview,
  onBulkAssessmentInvite,
}: CandidateBulkActionsToolbarProps) {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  if (selectedCount === 0) return null;

  const handleStageUpdate = (stageId: string) => {
    onBulkStageUpdate(stageId);
    toast({
      title: "Stage updated",
      description: `${selectedCount} candidate(s) moved successfully.`,
    });
  };

  const handlePriorityUpdate = (priority: 'high' | 'medium' | 'low') => {
    onBulkPriorityUpdate(priority);
    toast({
      title: "Priority updated",
      description: `${selectedCount} candidate(s) priority updated.`,
    });
  };

  const handleTagAdd = (tag: string) => {
    onBulkTagAdd([tag]);
    toast({
      title: "Tag added",
      description: `Tag added to ${selectedCount} candidate(s).`,
    });
  };

  const handleDelete = () => {
    onBulkDelete();
    setShowDeleteDialog(false);
    toast({
      title: "Candidates deleted",
      description: `${selectedCount} candidate(s) deleted successfully.`,
      variant: "destructive",
    });
  };

  const handleArchive = () => {
    onBulkArchive();
    setShowArchiveDialog(false);
    toast({
      title: "Candidates archived",
      description: `${selectedCount} candidate(s) archived successfully.`,
    });
  };

  return (
    <>
      <div className="sticky top-0 z-10 bg-primary/10 border-b border-primary/20 p-4 mb-4 rounded-lg">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Badge variant="default" className="font-semibold">
              {selectedCount} selected
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select onValueChange={handleStageUpdate}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Move to Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="screening">Phone Screen</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="final">Final Interview</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={handlePriorityUpdate}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Set Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={handleTagAdd}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Add Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="React">React</SelectItem>
                <SelectItem value="TypeScript">TypeScript</SelectItem>
                <SelectItem value="Python">Python</SelectItem>
                <SelectItem value="Senior">Senior</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
                <SelectItem value="Full-Stack">Full-Stack</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={onBulkAssessmentInvite}
            >
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Invite to Assessment
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onBulkEmail}
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onBulkScheduleInterview}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowArchiveDialog(true)}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} candidate(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected candidates.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive {selectedCount} candidate(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              Archived candidates can be restored later from the archive section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
