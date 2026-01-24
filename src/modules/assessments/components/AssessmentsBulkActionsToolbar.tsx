import { Button } from "@/shared/components/ui/button";
import { Bell, Download, X, XCircle } from "lucide-react";

interface AssessmentsBulkActionsToolbarProps {
  selectedCount: number;
  onSendReminders: () => void;
  onExportReports: () => void;
  onCancelAssessments: () => void;
  onClearSelection: () => void;
}

export function AssessmentsBulkActionsToolbar({
  selectedCount,
  onSendReminders,
  onExportReports,
  onCancelAssessments,
  onClearSelection,
}: AssessmentsBulkActionsToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-background border rounded-lg shadow-lg p-4 flex items-center gap-4">
        <span className="text-sm font-medium">
          {selectedCount} assessment{selectedCount > 1 ? 's' : ''} selected
        </span>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onSendReminders}>
            <Bell className="h-4 w-4 mr-2" />
            Send Reminders
          </Button>

          <Button size="sm" variant="outline" onClick={onExportReports}>
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>

          <Button size="sm" variant="outline" onClick={onCancelAssessments}>
            <XCircle className="h-4 w-4 mr-2" />
            Cancel Selected
          </Button>

          <Button size="sm" variant="ghost" onClick={onClearSelection}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
