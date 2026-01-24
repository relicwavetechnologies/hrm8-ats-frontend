import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { getLeaveRequests } from "@/shared/lib/leaveStorage";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, addMonths, subMonths } from "date-fns";
import type { LeaveRequest } from "@/shared/types/leave";

interface LeaveCalendarProps {
  department?: string;
}

export function LeaveCalendar({ department }: LeaveCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const allLeaveRequests = getLeaveRequests();
  
  const approvedLeaves = useMemo(() => {
    return allLeaveRequests.filter(req => req.status === 'approved');
  }, [allLeaveRequests]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getLeaveForDay = (date: Date): LeaveRequest[] => {
    return approvedLeaves.filter(leave => {
      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);
      return isWithinInterval(date, { start: leaveStart, end: leaveEnd });
    });
  };

  const selectedLeaves = selectedDate ? getLeaveForDay(selectedDate) : [];

  // Get the weekday of the first day of the month
  const firstDayOfMonth = monthStart.getDay();
  
  // Create padding days for the calendar grid
  const paddingDays = Array(firstDayOfMonth).fill(null);

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Team Leave Calendar</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-[140px] text-center font-semibold">
                {format(currentMonth, "MMMM yyyy")}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {/* Weekday headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                {day}
              </div>
            ))}
            
            {/* Padding days */}
            {paddingDays.map((_, index) => (
              <div key={`padding-${index}`} className="aspect-square" />
            ))}
            
            {/* Calendar days */}
            {days.map((day) => {
              const leaves = getLeaveForDay(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    aspect-square p-2 rounded-lg border text-sm transition-colors relative
                    ${isSelected ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent'}
                    ${!isSameMonth(day, currentMonth) ? 'text-muted-foreground' : ''}
                    ${isToday ? 'font-bold border-primary' : ''}
                  `}
                >
                  <div className="flex flex-col h-full">
                    <span className={isToday ? 'text-primary' : ''}>{format(day, 'd')}</span>
                    {leaves.length > 0 && (
                      <div className="flex-1 flex flex-col gap-1 mt-1 overflow-hidden">
                        {leaves.slice(0, 2).map((leave, idx) => (
                          <div
                            key={leave.id}
                            className="text-[9px] leading-tight px-1 py-0.5 rounded truncate"
                            style={{ 
                              backgroundColor: `${leave.leaveTypeColor}40`,
                              color: leave.leaveTypeColor
                            }}
                          >
                            {leave.employeeName.split(' ')[0]}
                          </div>
                        ))}
                        {leaves.length > 2 && (
                          <div className="text-[9px] text-muted-foreground">
                            +{leaves.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {selectedDate ? (
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {format(selectedDate, "MMMM d, yyyy")}
              </div>
            ) : (
              "Select a date"
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedLeaves.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                {selectedDate ? "No leave requests for this date" : "Click on a date to view details"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="p-3 rounded-lg border"
                  style={{ borderLeft: `4px solid ${leave.leaveTypeColor}` }}
                >
                  <div className="font-semibold text-sm mb-1">{leave.employeeName}</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {leave.leaveTypeName}
                  </div>
                  <div className="text-xs">
                    {format(new Date(leave.startDate), "MMM d")} - {format(new Date(leave.endDate), "MMM d")}
                    <Badge variant="outline" className="ml-2 text-xs">
                      {leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'}
                    </Badge>
                  </div>
                  {leave.reason && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {leave.reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
