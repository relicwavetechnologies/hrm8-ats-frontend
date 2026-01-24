import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { CheckSquare, Trash2, Download, RefreshCw, Mail } from "lucide-react";
import { OnboardingStatus } from "@/shared/types/onboarding";

interface OnboardingBulkActionsProps {
  selectedCount: number;
  onUpdateStatus: (status: OnboardingStatus) => void;
  onDelete: () => void;
  onExport: () => void;
  onSendEmail: () => void;
  onClearSelection: () => void;
}

export function OnboardingBulkActions({
  selectedCount,
  onUpdateStatus,
  onDelete,
  onExport,
  onSendEmail,
  onClearSelection,
}: OnboardingBulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border shadow-lg rounded-lg p-4 flex items-center gap-3 z-50">
      <div className="flex items-center gap-2">
        <CheckSquare className="h-4 w-4" />
        <span className="font-medium">{selectedCount} selected</span>
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onUpdateStatus('not-started')}>
              Not Started
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStatus('in-progress')}>
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStatus('completed')}>
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStatus('overdue')}>
              Overdue
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" variant="outline" onClick={onSendEmail}>
          <Mail className="h-4 w-4 mr-2" />
          Send Email
        </Button>

        <Button size="sm" variant="outline" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>

        <Button size="sm" variant="destructive" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>

      <div className="h-6 w-px bg-border" />

      <Button size="sm" variant="ghost" onClick={onClearSelection}>
        Clear
      </Button>
    </div>
  );
}
