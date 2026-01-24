import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { AlertCircle, UserX, Users, Merge } from "lucide-react";
import { detectDuplicates, type DuplicateMatch } from "@/shared/lib/duplicateDetectionService";
import { getCandidates } from "@/shared/lib/mockCandidateStorage";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

export function DuplicateDetectionPanel() {
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDuplicate, setSelectedDuplicate] = useState<DuplicateMatch | null>(null);

  useEffect(() => {
    scanForDuplicates();
  }, []);

  const scanForDuplicates = () => {
    setLoading(true);
    const candidates = getCandidates();
    const found = detectDuplicates(candidates);
    setDuplicates(found);
    setLoading(false);
  };

  const handleMerge = (duplicate: DuplicateMatch) => {
    setSelectedDuplicate(duplicate);
  };

  const confirmMerge = () => {
    // In a real implementation, this would merge the candidates
    // For now, we'll just remove from the duplicates list
    if (selectedDuplicate) {
      setDuplicates(duplicates.filter(d => d.id !== selectedDuplicate.id));
      setSelectedDuplicate(null);
    }
  };

  const dismissDuplicate = (duplicateId: string) => {
    setDuplicates(duplicates.filter(d => d.id !== duplicateId));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Scanning for Duplicates...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (duplicates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-success" />
            No Duplicates Found
          </CardTitle>
          <CardDescription>
            All candidates appear to be unique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={scanForDuplicates} variant="outline">
            Scan Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                Duplicate Candidates Detected
              </CardTitle>
              <CardDescription>
                {duplicates.length} potential duplicate{duplicates.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <Button onClick={scanForDuplicates} variant="outline" size="sm">
              Rescan
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Review Suggested Matches</AlertTitle>
            <AlertDescription>
              These candidates may be duplicates. Review and merge or dismiss each match.
            </AlertDescription>
          </Alert>

          {duplicates.map((duplicate) => (
            <Card key={duplicate.id} className="border-warning/20 bg-warning/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-warning text-warning">
                    {duplicate.matchScore}% Match
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMerge(duplicate)}
                    >
                      <Merge className="h-4 w-4 mr-2" />
                      Review & Merge
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissDuplicate(duplicate.id)}
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Not a Duplicate
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {/* Candidate 1 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={duplicate.candidate1.photo} />
                        <AvatarFallback>
                          {duplicate.candidate1.firstName[0]}{duplicate.candidate1.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{duplicate.candidate1.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {duplicate.candidate1.position}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="text-muted-foreground">Email: {duplicate.candidate1.email}</div>
                      <div className="text-muted-foreground">Phone: {duplicate.candidate1.phone}</div>
                      <div className="text-muted-foreground">
                        Location: {duplicate.candidate1.location}
                      </div>
                    </div>
                  </div>

                  {/* Candidate 2 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={duplicate.candidate2.photo} />
                        <AvatarFallback>
                          {duplicate.candidate2.firstName[0]}{duplicate.candidate2.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{duplicate.candidate2.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {duplicate.candidate2.position}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="text-muted-foreground">Email: {duplicate.candidate2.email}</div>
                      <div className="text-muted-foreground">Phone: {duplicate.candidate2.phone}</div>
                      <div className="text-muted-foreground">
                        Location: {duplicate.candidate2.location}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Match Reasons */}
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm font-medium mb-2">Match Reasons:</div>
                  <div className="flex flex-wrap gap-2">
                    {duplicate.matchReasons.map((reason, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Merge Dialog */}
      <Dialog open={!!selectedDuplicate} onOpenChange={(open) => !open && setSelectedDuplicate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Merge Duplicate Candidates</DialogTitle>
            <DialogDescription>
              Choose which candidate record to keep as primary. Data can be merged.
            </DialogDescription>
          </DialogHeader>
          {selectedDuplicate && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This action will merge the candidates. The secondary record will be archived.
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">{selectedDuplicate.candidate1.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Keep as Primary
                    </div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">{selectedDuplicate.candidate2.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Keep as Primary
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDuplicate(null)}>
              Cancel
            </Button>
            <Button onClick={confirmMerge}>
              Merge Candidates
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
