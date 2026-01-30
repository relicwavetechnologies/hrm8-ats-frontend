import { useMemo } from "react";
import { Application } from "@/shared/types/application";
import { JobRound } from "@/shared/lib/jobRoundService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { ApplicationCard } from "./ApplicationCard";
import { Users, Filter } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface RoundDetailViewProps {
  jobId: string;
  round: JobRound;
  applications: Application[];
  onApplicationClick: (app: Application) => void;
  onMoveToRound?: (appId: string, roundId: string) => void;
  allRounds?: JobRound[];
}

export function RoundDetailView({
  jobId,
  round,
  applications,
  onApplicationClick,
  onMoveToRound,
  allRounds
}: RoundDetailViewProps) {
  
  // Filter applications for this specific round
  // Note: We need to match application.roundId or stage to the round.
  // Assuming application.roundId is the link.
  const roundApplications = useMemo(() => {
    return applications.filter(app => app.roundId === round.id);
  }, [applications, round.id]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {round.name}
            <Badge variant="secondary" className="rounded-full">
              {roundApplications.length}
            </Badge>
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage candidates in the {round.name} stage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="default" size="sm">
            Bulk Actions
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {roundApplications.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <Users className="h-12 w-12 mb-4 opacity-20" />
              <h3 className="text-lg font-medium">No candidates in this round</h3>
              <p className="text-sm max-w-sm mt-1">
                Move candidates to this round from the Pipeline view or other rounds.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {roundApplications.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onClick={() => onApplicationClick(app)}
                  variant="minimal" // Keep consistency
                  allRounds={allRounds}
                  onMoveToRound={onMoveToRound}
                  // We can add specific round actions here
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
