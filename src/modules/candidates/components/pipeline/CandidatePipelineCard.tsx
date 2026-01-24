import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  Mail, 
  Calendar, 
  Eye, 
  Star,
  StarOff,
  Archive,
  Trash2 
} from "lucide-react";
import { PipelineCandidate } from "@/shared/lib/pipelineService";
import { formatDistanceToNow } from "date-fns";

interface CandidatePipelineCardProps {
  candidate: PipelineCandidate;
  onViewDetails: () => void;
  onScheduleInterview: () => void;
  onSendEmail: () => void;
  onTogglePriority: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export function CandidatePipelineCard({
  candidate,
  onViewDetails,
  onScheduleInterview,
  onSendEmail,
  onTogglePriority,
  onArchive,
  onDelete,
}: CandidatePipelineCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: candidate.id,
    data: {
      type: 'candidate',
      candidate,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-600 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500/10 text-green-600 dark:text-green-400';
    if (score >= 75) return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    if (score >= 60) return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
    return 'bg-red-500/10 text-red-600 dark:text-red-400';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isDragging ? 'opacity-50' : ''}
    >
      <Card className="p-4 hover:shadow-md transition-shadow cursor-move group">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={candidate.avatar} alt={candidate.name} />
              <AvatarFallback>{getInitials(candidate.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{candidate.name}</h4>
              <p className="text-xs text-muted-foreground truncate">{candidate.jobTitle}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onViewDetails}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSendEmail}>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onScheduleInterview}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Interview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onTogglePriority}>
                {candidate.priority === 'high' ? (
                  <>
                    <StarOff className="h-4 w-4 mr-2" />
                    Remove Priority
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4 mr-2" />
                    Mark Priority
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onArchive}>
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={getPriorityColor(candidate.priority)}>
              {candidate.priority}
            </Badge>
            {candidate.matchScore && (
              <Badge variant="outline" className={getScoreColor(candidate.matchScore)}>
                {candidate.matchScore}% match
              </Badge>
            )}
          </div>

          {candidate.tags && candidate.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {candidate.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {candidate.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{candidate.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>Applied {formatDistanceToNow(new Date(candidate.appliedDate), { addSuffix: true })}</span>
          </div>

          {candidate.nextInterviewDate && (
            <div className="flex items-center gap-1 text-xs text-primary">
              <Calendar className="h-3 w-3" />
              <span>Interview scheduled</span>
            </div>
          )}
        </div>

        {/* Quick actions on hover */}
        <div className="flex items-center gap-1 mt-3 pt-3 border-t opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onSendEmail();
            }}
          >
            <Mail className="h-3 w-3 mr-1" />
            Email
          </Button>
        </div>
      </Card>
    </div>
  );
}
