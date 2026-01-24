import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ConflictWarningBannerProps {
  conflictCount: number;
  onResolve: () => void;
  onRefresh: () => void;
}

export const ConflictWarningBanner: React.FC<ConflictWarningBannerProps> = ({
  conflictCount,
  onResolve,
  onRefresh,
}) => {
  return (
    <Alert variant="destructive" className="animate-pulse">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Editing Conflict Detected</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          {conflictCount} conflict{conflictCount > 1 ? 's' : ''} found. 
          Another user has modified this feedback while you were editing.
        </span>
        <div className="flex gap-2 ml-4">
          <Button size="sm" variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
          <Button size="sm" onClick={onResolve}>
            Resolve Conflicts
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
