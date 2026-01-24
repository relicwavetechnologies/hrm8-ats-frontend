import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { History, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DraftRestoreAlertProps {
  timestamp: string;
  onRestore: () => void;
  onDiscard: () => void;
}

export function DraftRestoreAlert({ timestamp, onRestore, onDiscard }: DraftRestoreAlertProps) {
  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });

  return (
    <Alert className="mb-6 border-primary/50 bg-primary/5">
      <History className="h-4 w-4" />
      <AlertTitle className="mb-2">Unsaved Changes Found</AlertTitle>
      <AlertDescription className="space-y-3">
        <p className="text-sm">
          You have unsaved changes from {timeAgo}. Would you like to restore them?
        </p>
        <div className="flex gap-2">
          <Button
            onClick={onRestore}
            size="sm"
            variant="default"
          >
            Restore Draft
          </Button>
          <Button
            onClick={onDiscard}
            size="sm"
            variant="outline"
          >
            <X className="h-4 w-4 mr-2" />
            Discard
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
