import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { CandidatePipelineColumn } from "./CandidatePipelineColumn";
import { CandidatePipelineCard } from "./CandidatePipelineCard";
import {
  getPipelineStages,
  getPipelineCandidates,
  moveCandidateToStage,
  PipelineCandidate,
  PipelineStage,
} from "@/shared/lib/pipelineService";
import { useToast } from "@/shared/hooks/use-toast";
import { ScrollArea, ScrollBar } from "@/shared/components/ui/scroll-area";

interface CandidatePipelineBoardProps {
  filters?: {
    jobId?: string;
    priority?: 'high' | 'medium' | 'low';
    search?: string;
  };
  onViewDetails?: (candidate: PipelineCandidate) => void;
}

export function CandidatePipelineBoard({ 
  filters,
  onViewDetails 
}: CandidatePipelineBoardProps) {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [candidates, setCandidates] = useState<PipelineCandidate[]>([]);
  const [activeCandidate, setActiveCandidate] = useState<PipelineCandidate | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = () => {
    const pipelineStages = getPipelineStages();
    const pipelineCandidates = getPipelineCandidates(filters);
    setStages(pipelineStages);
    setCandidates(pipelineCandidates);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const candidate = candidates.find(c => c.id === active.id);
    if (candidate) {
      setActiveCandidate(candidate);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCandidate(null);

    if (!over) return;

    const candidateId = active.id as string;
    const newStageId = over.id as string;

    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    // Don't do anything if dropped in same stage
    if (candidate.stageId === newStageId) return;

    // Update candidate stage
    const updated = moveCandidateToStage(candidateId, newStageId);
    if (updated) {
      const stageName = stages.find(s => s.id === newStageId)?.name;
      toast({
        title: "Candidate moved",
        description: `${candidate.name} moved to ${stageName}`,
      });
      loadData();
    }
  };

  const getCandidatesByStage = (stageId: string) => {
    return candidates.filter(c => c.stageId === stageId);
  };

  const handleViewDetails = (candidate: PipelineCandidate) => {
    onViewDetails?.(candidate);
  };

  const handleScheduleInterview = (candidate: PipelineCandidate) => {
    toast({
      title: "Schedule interview",
      description: `Scheduling interview for ${candidate.name}`,
    });
  };

  const handleSendEmail = (candidate: PipelineCandidate) => {
    toast({
      title: "Send email",
      description: `Opening email composer for ${candidate.name}`,
    });
  };

  const handleTogglePriority = (candidate: PipelineCandidate) => {
    const newPriority = candidate.priority === 'high' ? 'medium' : 'high';
    toast({
      title: "Priority updated",
      description: `${candidate.name} priority set to ${newPriority}`,
    });
    loadData();
  };

  const handleArchive = (candidate: PipelineCandidate) => {
    toast({
      title: "Candidate archived",
      description: `${candidate.name} has been archived`,
    });
  };

  const handleDelete = (candidate: PipelineCandidate) => {
    toast({
      title: "Candidate deleted",
      description: `${candidate.name} has been deleted`,
      variant: "destructive",
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <ScrollArea className="w-full">
        <div className="flex gap-6 p-4 min-w-max">
          {stages.filter(s => s.isActive).map((stage) => (
            <CandidatePipelineColumn
              key={stage.id}
              id={stage.id}
              title={stage.name}
              candidates={getCandidatesByStage(stage.id)}
              color={stage.color}
              onViewDetails={handleViewDetails}
              onScheduleInterview={handleScheduleInterview}
              onSendEmail={handleSendEmail}
              onTogglePriority={handleTogglePriority}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <DragOverlay>
        {activeCandidate ? (
          <div className="rotate-3 scale-105">
            <CandidatePipelineCard
              candidate={activeCandidate}
              onViewDetails={() => {}}
              onScheduleInterview={() => {}}
              onSendEmail={() => {}}
              onTogglePriority={() => {}}
              onArchive={() => {}}
              onDelete={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
