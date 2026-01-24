import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Badge } from '@/shared/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { useToast } from '@/shared/hooks/use-toast';
import { 
  Download, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  MoreVertical,
  Mail,
  Archive,
} from 'lucide-react';

interface BulkActionsToolbarProps {
  selectedIds: string[];
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onExport: (ids: string[]) => void;
  onDelete: (ids: string[]) => void;
  onApprove?: (ids: string[]) => void;
  onReject?: (ids: string[]) => void;
  onArchive?: (ids: string[]) => void;
  onSendReminder?: (ids: string[]) => void;
}

export function BulkActionsToolbar({
  selectedIds,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onExport,
  onDelete,
  onApprove,
  onReject,
  onArchive,
  onSendReminder,
}: BulkActionsToolbarProps) {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const hasSelection = selectedIds.length > 0;
  const isAllSelected = selectedIds.length === totalCount && totalCount > 0;

  const handleExport = () => {
    onExport(selectedIds);
    toast({
      title: 'Export Started',
      description: `Exporting ${selectedIds.length} items...`,
    });
  };

  const handleDelete = () => {
    onDelete(selectedIds);
    setShowDeleteDialog(false);
    toast({
      title: 'Items Deleted',
      description: `${selectedIds.length} items have been deleted.`,
    });
  };

  const handleApprove = () => {
    if (onApprove) {
      onApprove(selectedIds);
      setShowApproveDialog(false);
      toast({
        title: 'Items Approved',
        description: `${selectedIds.length} items have been approved.`,
      });
    }
  };

  const handleReject = () => {
    if (onReject) {
      onReject(selectedIds);
      setShowRejectDialog(false);
      toast({
        title: 'Items Rejected',
        description: `${selectedIds.length} items have been rejected.`,
      });
    }
  };

  const handleArchive = () => {
    if (onArchive) {
      onArchive(selectedIds);
      toast({
        title: 'Items Archived',
        description: `${selectedIds.length} items have been archived.`,
      });
    }
  };

  const handleSendReminder = () => {
    if (onSendReminder) {
      onSendReminder(selectedIds);
      toast({
        title: 'Reminders Sent',
        description: `Reminder emails sent for ${selectedIds.length} items.`,
      });
    }
  };

  if (!hasSelection) {
    return (
      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={(checked) => {
            if (checked) {
              onSelectAll();
            } else {
              onDeselectAll();
            }
          }}
        />
        <span className="text-sm text-muted-foreground">
          Select items to perform bulk actions
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20 animate-fade-in">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={(checked) => {
              if (checked) {
                onSelectAll();
              } else {
                onDeselectAll();
              }
            }}
          />
          <Badge variant="default" className="font-semibold">
            {selectedIds.length} selected
          </Badge>
          {selectedIds.length < totalCount && (
            <Button
              variant="link"
              size="sm"
              onClick={onSelectAll}
              className="h-auto p-0"
            >
              Select all {totalCount}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          {onApprove && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowApproveDialog(true)}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve
            </Button>
          )}

          {onReject && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRejectDialog(true)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4 mr-2" />
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onSendReminder && (
                <>
                  <DropdownMenuItem onClick={handleSendReminder}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Reminders
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {onArchive && (
                <>
                  <DropdownMenuItem onClick={handleArchive}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            onClick={onDeselectAll}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.length} items?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected items.
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

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve {selectedIds.length} items?</AlertDialogTitle>
            <AlertDialogDescription>
              This will approve all selected feedback requests and notify the relevant parties.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove}>
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject {selectedIds.length} items?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reject all selected feedback requests. You may want to add a reason in individual rejections.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
