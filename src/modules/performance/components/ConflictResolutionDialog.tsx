import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Label } from '@/shared/components/ui/label';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';
import { FeedbackConflict, ConflictResolution } from '@/shared/types/feedbackConflict';
import { AlertTriangle, User, Clock, CheckCircle2, XCircle, GitMerge } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ConflictResolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflicts: FeedbackConflict[];
  onResolve: (resolutions: ConflictResolution[]) => void;
  onCancel: () => void;
}

export const ConflictResolutionDialog: React.FC<ConflictResolutionDialogProps> = ({
  open,
  onOpenChange,
  conflicts,
  onResolve,
  onCancel,
}) => {
  const [resolutions, setResolutions] = useState<Map<string, 'keep-local' | 'accept-remote' | 'merge'>>(
    new Map()
  );

  const handleResolutionChange = (field: string, resolution: 'keep-local' | 'accept-remote' | 'merge') => {
    const newResolutions = new Map(resolutions);
    newResolutions.set(field, resolution);
    setResolutions(newResolutions);
  };

  const handleResolveAll = () => {
    const resolvedConflicts: ConflictResolution[] = conflicts.map(conflict => ({
      feedbackId: conflict.feedbackId,
      field: conflict.field,
      chosenValue: resolutions.get(conflict.field) === 'accept-remote' 
        ? conflict.remoteValue 
        : resolutions.get(conflict.field) === 'merge'
        ? mergeValues(conflict.localValue, conflict.remoteValue)
        : conflict.localValue,
      resolution: resolutions.get(conflict.field) || 'keep-local',
      resolvedBy: 'current-user',
      resolvedAt: new Date(),
    }));

    onResolve(resolvedConflicts);
    setResolutions(new Map());
  };

  const mergeValues = (local: any, remote: any) => {
    // Simple merge strategy - for arrays, combine unique items
    if (Array.isArray(local) && Array.isArray(remote)) {
      const mergedIds = new Set([...local.map((item: any) => item.id)]);
      const uniqueRemote = remote.filter((item: any) => !mergedIds.has(item.id));
      return [...local, ...uniqueRemote];
    }
    // For primitives, prefer local
    return local;
  };

  const formatFieldName = (field: string) => {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const formatValue = (value: any, field: string) => {
    if (field === 'comments' && Array.isArray(value)) {
      return `${value.length} comment(s)`;
    }
    if (field === 'recommendation') {
      return value.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const allResolved = conflicts.every(conflict => resolutions.has(conflict.field));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Resolve Editing Conflicts
          </DialogTitle>
          <DialogDescription>
            Multiple users have edited this feedback simultaneously. Choose which version to keep for each conflict.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {conflicts.map((conflict, index) => {
              const currentResolution = resolutions.get(conflict.field);
              
              return (
                <Card key={`${conflict.feedbackId}-${conflict.field}-${index}`} className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        Conflict #{index + 1}: {formatFieldName(conflict.field)}
                      </span>
                      {currentResolution && (
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Resolved
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RadioGroup
                      value={currentResolution}
                      onValueChange={(value) => handleResolutionChange(
                        conflict.field,
                        value as 'keep-local' | 'accept-remote' | 'merge'
                      )}
                    >
                      {/* Local Version */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="keep-local" id={`local-${index}`} />
                          <Label
                            htmlFor={`local-${index}`}
                            className="flex items-center gap-2 cursor-pointer flex-1"
                          >
                            <Badge variant="default">Your Version</Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {conflict.localUser}
                              <Clock className="h-3 w-3 ml-2" />
                              {formatDistanceToNow(conflict.localTimestamp, { addSuffix: true })}
                            </span>
                          </Label>
                        </div>
                        <Card className="ml-6 bg-accent/30">
                          <CardContent className="pt-3">
                            <pre className="text-sm whitespace-pre-wrap">
                              {formatValue(conflict.localValue, conflict.field)}
                            </pre>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Remote Version */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="accept-remote" id={`remote-${index}`} />
                          <Label
                            htmlFor={`remote-${index}`}
                            className="flex items-center gap-2 cursor-pointer flex-1"
                          >
                            <Badge variant="secondary">Their Version</Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {conflict.remoteUser}
                              <Clock className="h-3 w-3 ml-2" />
                              {formatDistanceToNow(conflict.remoteTimestamp, { addSuffix: true })}
                            </span>
                          </Label>
                        </div>
                        <Card className="ml-6 bg-secondary/30">
                          <CardContent className="pt-3">
                            <pre className="text-sm whitespace-pre-wrap">
                              {formatValue(conflict.remoteValue, conflict.field)}
                            </pre>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Merge Option (for compatible types) */}
                      {Array.isArray(conflict.localValue) && Array.isArray(conflict.remoteValue) && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="merge" id={`merge-${index}`} />
                            <Label
                              htmlFor={`merge-${index}`}
                              className="flex items-center gap-2 cursor-pointer flex-1"
                            >
                              <Badge variant="outline" className="gap-1">
                                <GitMerge className="h-3 w-3" />
                                Merge Both
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Combine both versions
                              </span>
                            </Label>
                          </div>
                          <Card className="ml-6 bg-muted/30">
                            <CardContent className="pt-3">
                              <pre className="text-sm whitespace-pre-wrap">
                                {formatValue(
                                  mergeValues(conflict.localValue, conflict.remoteValue),
                                  conflict.field
                                )}
                              </pre>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </RadioGroup>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>

        <Separator />

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {allResolved ? (
              <span className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                All conflicts resolved
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                {conflicts.length - resolutions.size} conflict(s) remaining
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleResolveAll} disabled={!allResolved}>
              Apply Resolution{conflicts.length > 1 ? 's' : ''}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
