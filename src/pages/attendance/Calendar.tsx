import { useState, useEffect } from "react";
import { DashboardPageLayout } from "@/components/layouts/DashboardPageLayout";
import { AtsPageHeader } from "@/components/layouts/AtsPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Video, MapPin, Users } from "lucide-react";
import { getInterviews } from "@/shared/lib/mockInterviewStorage";
import { Interview } from "@/shared/types/interview";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = () => {
    setInterviews(getInterviews());
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getInterviewsForDate = (date: Date) => {
    return interviews.filter(interview => 
      isSameDay(new Date(interview.scheduledDate), date)
    );
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const dayInterviews = selectedDate ? getInterviewsForDate(selectedDate) : [];

  const getTypeIcon = (type: Interview['type']) => {
    switch (type) {
      case 'video': return <Video className="h-3 w-3" />;
      case 'in-person': return <MapPin className="h-3 w-3" />;
      case 'panel': return <Users className="h-3 w-3" />;
      default: return <CalendarIcon className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: Interview['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-gray-500';
      case 'no-show': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <AtsPageHeader title="Calendar" subtitle="View and manage interviews and events">
          <div className="text-base font-semibold flex items-center gap-2">
            <Button variant="outline" onClick={handleToday}>Today</Button>
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </AtsPageHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {format(currentDate, 'MMMM yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="overflow-x-auto -mx-1 px-1">
                <div className="grid grid-cols-7 gap-1 min-w-[700px]">
                {/* Day Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
                
                {/* Calendar Days */}
                {calendarDays.map((day, index) => {
                  const dayInterviews = getInterviewsForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        min-h-[80px] p-2 border rounded-lg text-left relative
                        transition-colors hover:bg-accent
                        ${!isCurrentMonth ? 'text-muted-foreground bg-muted/30' : ''}
                        ${isToday ? 'border-primary border-2' : ''}
                        ${isSelected ? 'bg-primary/10 border-primary' : ''}
                      `}
                    >
                      <div className={`text-sm font-semibold ${isToday ? 'text-primary' : ''}`}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1 mt-1">
                        {dayInterviews.slice(0, 2).map((interview) => (
                          <div
                            key={interview.id}
                            className={`text-xs px-1 py-0.5 rounded truncate ${getStatusColor(interview.status)} text-white`}
                          >
                            {interview.scheduledTime} {getTypeIcon(interview.type)}
                          </div>
                        ))}
                        {dayInterviews.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayInterviews.length - 2} more
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Day Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate && dayInterviews.length > 0 ? (
                <div className="space-y-3">
                  {dayInterviews.map((interview) => (
                    <Card key={interview.id}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="text-base font-semibold flex items-center gap-2">
                            {getTypeIcon(interview.type)}
                            <span className="font-semibold">{interview.scheduledTime}</span>
                          </div>
                          <Badge variant={interview.status === 'scheduled' ? 'default' : 'secondary'}>
                            {interview.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="font-medium">{interview.candidateName}</p>
                          <p className="text-sm text-muted-foreground">{interview.jobTitle}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Duration: {interview.duration} minutes
                        </div>
                        {interview.type === 'video' && interview.meetingLink && (
                          <Button variant="outline" size="sm" className="w-full" asChild>
                            <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer">
                              Join Meeting
                            </a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : selectedDate ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No events scheduled for this day
                </p>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Select a date to view events
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
