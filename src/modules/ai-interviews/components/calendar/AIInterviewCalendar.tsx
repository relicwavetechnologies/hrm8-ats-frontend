import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { getAIInterviewSessions } from '@/shared/lib/aiInterview/aiInterviewStorage';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Video, Phone, MessageSquare } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const modeIcons = {
  video: Video,
  phone: Phone,
  text: MessageSquare,
};

export function AIInterviewCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();
  const sessions = getAIInterviewSessions();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getInterviewsForDay = (day: Date) => {
    return sessions.filter(session => 
      isSameDay(new Date(session.scheduledDate), day)
    );
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    ready: 'bg-green-500/10 text-green-700 border-green-500/20',
    'in-progress': 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
    completed: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
    cancelled: 'bg-red-500/10 text-red-700 border-red-500/20',
    'no-show': 'bg-gray-500/10 text-gray-700 border-gray-500/20',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Interview Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
          
          {daysInMonth.map(day => {
            const interviews = getInterviewsForDay(day);
            const hasInterviews = interviews.length > 0;
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[80px] p-2 border rounded-lg ${
                  !isCurrentMonth ? 'bg-muted/30' : ''
                } ${isCurrentDay ? 'border-primary bg-primary/5' : 'border-border'}`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  !isCurrentMonth ? 'text-muted-foreground' : ''
                } ${isCurrentDay ? 'text-primary font-bold' : ''}`}>
                  {format(day, 'd')}
                </div>
                
                {hasInterviews && (
                  <div className="space-y-1">
                    {interviews.slice(0, 3).map(interview => {
                      const Icon = modeIcons[interview.interviewMode];
                      return (
                        <Button
                          key={interview.id}
                          variant="ghost"
                          onClick={() => navigate(`/ai-interviews/${interview.id}`)}
                          className={`w-full text-left px-1.5 py-1 h-auto rounded text-xs border justify-start flex-col items-start space-y-0 ${statusColors[interview.status]} hover:opacity-80 transition-opacity`}
                        >
                          <div className="flex items-center gap-1">
                            <Icon className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{format(new Date(interview.scheduledDate), 'HH:mm')}</span>
                          </div>
                          <div className="truncate font-medium">{interview.candidateName}</div>
                        </Button>
                      );
                    })}
                    {interviews.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{interviews.length - 3} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
          <div className="text-xs font-medium text-muted-foreground">Legend:</div>
          {Object.entries(statusColors).map(([status, className]) => (
            <Badge key={status} variant="outline" className={className}>
              {status}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
