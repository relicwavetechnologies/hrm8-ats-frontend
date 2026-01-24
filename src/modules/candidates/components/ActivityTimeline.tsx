import React from 'react';
import { Timeline, TimelineItem } from '@/shared/components/ui/timeline';
import {
  User,
  Briefcase,
  Calendar,
  Mail,
  StickyNote,
  FileText,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { CandidateHistoryEvent } from '@/shared/lib/mockCandidateHistory';

const EVENT_ICONS = {
  status_change: CheckCircle,
  job_application: Briefcase,
  interview: Calendar,
  email_sent: Mail,
  note_added: StickyNote,
  document_uploaded: FileText,
  profile_updated: Edit,
};

const EVENT_VARIANTS = {
  status_change: 'default' as const,
  job_application: 'default' as const,
  interview: 'success' as const,
  email_sent: 'default' as const,
  note_added: 'default' as const,
  document_uploaded: 'default' as const,
  profile_updated: 'default' as const,
};

interface ActivityTimelineProps {
  events: CandidateHistoryEvent[];
}

export function ActivityTimeline({ events }: ActivityTimelineProps) {
  const timelineItems: TimelineItem[] = events.map((event) => {
    const Icon = EVENT_ICONS[event.eventType] || Clock;
    
    return {
      id: event.id,
      title: event.title,
      description: event.description 
        ? `${event.description}${event.userName ? ` • by ${event.userName}` : ''}`
        : event.userName 
        ? `by ${event.userName}` 
        : undefined,
      timestamp: event.timestamp,
      icon: <Icon className="h-4 w-4" />,
      variant: EVENT_VARIANTS[event.eventType],
    };
  });

  return <Timeline items={timelineItems} />;
}