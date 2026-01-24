import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CandidatePipelineCard } from "./CandidatePipelineCard";
import { Badge } from "@/shared/components/ui/badge";
import { PipelineCandidate } from "@/shared/lib/pipelineService";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

interface CandidatePipelineColumnProps {
  id: string;
  title: string;
  candidates: PipelineCandidate[];
  color: string;
  onViewDetails: (candidate: PipelineCandidate) => void;
  onScheduleInterview: (candidate: PipelineCandidate) => void;
  onSendEmail: (candidate: PipelineCandidate) => void;
  onTogglePriority: (candidate: PipelineCandidate) => void;
  onArchive: (candidate: PipelineCandidate) => void;
  onDelete: (candidate: PipelineCandidate) => void;
}

export function CandidatePipelineColumn({
  id,
  title,
  candidates,
  color,
  onViewDetails,
  onScheduleInterview,
  onSendEmail,
  onTogglePriority,
  onArchive,
  onDelete,
}: CandidatePipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col h-full min-w-[300px]">
      <div className="flex items-center justify-between mb-4 sticky top-0 z-10 bg-background pb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <h4 className="font-semibold">{title}</h4>
        </div>
        <Badge variant="outline">{candidates.length}</Badge>
      </div>

      <SortableContext
        id={id}
        items={candidates.map((candidate) => candidate.id)}
        strategy={verticalListSortingStrategy}
      >
        <ScrollArea className="flex-1">
          <div
            ref={setNodeRef}
            className={`space-y-3 p-2 rounded-lg min-h-[500px] transition-colors ${
              isOver ? 'bg-primary/5 border-2 border-primary border-dashed' : 'bg-muted/20'
            }`}
          >
            {candidates.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                No candidates
              </div>
            ) : (
              candidates.map((candidate) => (
                <CandidatePipelineCard
                  key={candidate.id}
                  candidate={candidate}
                  onViewDetails={() => onViewDetails(candidate)}
                  onScheduleInterview={() => onScheduleInterview(candidate)}
                  onSendEmail={() => onSendEmail(candidate)}
                  onTogglePriority={() => onTogglePriority(candidate)}
                  onArchive={() => onArchive(candidate)}
                  onDelete={() => onDelete(candidate)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </SortableContext>
    </div>
  );
}
