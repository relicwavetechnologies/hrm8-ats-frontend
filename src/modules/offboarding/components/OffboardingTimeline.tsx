import { CheckCircle, Circle, Clock, FileText, UserMinus } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { format, parseISO } from "date-fns";
import type { OffboardingWorkflow } from "@/shared/types/offboarding";

interface OffboardingTimelineProps {
  workflow: OffboardingWorkflow;
}

export function OffboardingTimeline({ workflow }: OffboardingTimelineProps) {
  const timelineEvents = [
    {
      id: 'initiated',
      title: 'Offboarding Initiated',
      description: `Notice received from ${workflow.employeeName}`,
      date: workflow.noticeDate,
      icon: UserMinus,
      completed: true,
    },
    ...workflow.clearanceItems
      .filter(item => item.completedAt)
      .map(item => ({
        id: item.id,
        title: `${item.item} Cleared`,
        description: `${item.category} clearance completed`,
        date: item.completedAt!,
        icon: CheckCircle,
        completed: true,
      })),
    {
      id: 'exit-interview',
      title: workflow.exitInterviewCompleted ? 'Exit Interview Completed' : 'Exit Interview Scheduled',
      description: workflow.exitInterviewCompleted 
        ? 'Feedback collected and recorded'
        : workflow.exitInterviewScheduled 
          ? `Scheduled for ${workflow.exitInterviewDate ? format(new Date(workflow.exitInterviewDate), 'MMM d, yyyy') : 'TBD'}`
          : 'Not yet scheduled',
      date: workflow.exitInterviewDate || workflow.lastWorkingDay,
      icon: FileText,
      completed: workflow.exitInterviewCompleted,
    },
    {
      id: 'last-day',
      title: 'Last Working Day',
      description: workflow.status === 'completed' ? 'Employee departed' : 'Final day of employment',
      date: workflow.lastWorkingDay,
      icon: Clock,
      completed: workflow.status === 'completed',
    },
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card>
      <CardContent className="p-6">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-border" />

          <div className="space-y-8">
            {timelineEvents.map((event, index) => {
              const Icon = event.icon;
              const isLast = index === timelineEvents.length - 1;

              return (
                <div key={event.id} className="relative flex gap-4">
                  {/* Icon */}
                  <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    event.completed 
                      ? 'bg-primary border-primary' 
                      : 'bg-background border-border'
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      event.completed ? 'text-primary-foreground' : 'text-muted-foreground'
                    }`} />
                  </div>

                  {/* Content */}
                  <div className={`flex-1 ${!isLast ? 'pb-8' : ''}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className={`font-medium ${
                          event.completed ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {event.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      </div>
                      <time className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(event.date), 'MMM d, yyyy')}
                      </time>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
