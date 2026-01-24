import { useState, useMemo } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Edit, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { useToast } from "@/shared/hooks/use-toast";
import { getAttendanceRecords, updateAttendanceRecord } from "@/shared/lib/attendanceStorage";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, parseISO, isSameDay } from "date-fns";
import { cn } from "@/shared/lib/utils";
import type { AttendanceRecord, AttendanceStatus } from "@/shared/types/attendance";

export function TimesheetView() {
  const { toast } = useToast();
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<AttendanceRecord>>({});

  const records = getAttendanceRecords();
  
  // Mock current employee
  const currentEmployee = {
    id: 'emp-001',
    name: 'Current User',
  };

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 }); // Start on Monday
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const weekRecords = useMemo(() => {
    return weekDays.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const record = records.find(r => 
        r.employeeId === currentEmployee.id && 
        r.date === dateStr
      );
      return { date: day, dateStr, record };
    });
  }, [weekDays, records, currentEmployee.id]);

  const weekStats = useMemo(() => {
    const totalHours = weekRecords.reduce((sum, { record }) => sum + (record?.workHours || 0), 0);
    const totalOvertime = weekRecords.reduce((sum, { record }) => sum + (record?.overtimeHours || 0), 0);
    const presentDays = weekRecords.filter(({ record }) => record && ['present', 'late', 'half-day'].includes(record.status)).length;
    return { totalHours, totalOvertime, presentDays };
  }, [weekRecords]);

  const handleEdit = (recordId: string, record: AttendanceRecord) => {
    setEditingRecord(recordId);
    setEditValues({
      checkIn: record.checkIn,
      checkOut: record.checkOut,
      status: record.status,
      notes: record.notes,
    });
  };

  const handleSave = (recordId: string) => {
    updateAttendanceRecord(recordId, editValues);
    setEditingRecord(null);
    setEditValues({});
    toast({
      title: "Updated",
      description: "Timesheet record updated successfully",
    });
  };

  const handleCancel = () => {
    setEditingRecord(null);
    setEditValues({});
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    const variants: Record<AttendanceStatus, { variant: any; label: string }> = {
      present: { variant: 'outline', label: 'Present' },
      absent: { variant: 'destructive', label: 'Absent' },
      late: { variant: 'default', label: 'Late' },
      'half-day': { variant: 'secondary', label: 'Half Day' },
      'on-leave': { variant: 'secondary', label: 'On Leave' },
      holiday: { variant: 'secondary', label: 'Holiday' },
    };
    return variants[status];
  };

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedWeek(subWeeks(selectedWeek, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedWeek}
                    onSelect={(date) => date && setSelectedWeek(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              <div className="text-sm text-muted-foreground">
                {weekStats.totalHours.toFixed(1)}h total • {weekStats.totalOvertime.toFixed(1)}h overtime • {weekStats.presentDays} days
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedWeek(addWeeks(selectedWeek, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timesheet Table */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Timesheet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weekRecords.map(({ date, dateStr, record }) => {
              const isEditing = editingRecord === record?.id;
              const isToday = isSameDay(date, new Date());
              const statusBadge = record && getStatusBadge(record.status);

              return (
                <div
                  key={dateStr}
                  className={cn(
                    "p-4 border rounded-lg",
                    isToday && "border-primary bg-accent/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="min-w-[100px]">
                          <p className="font-medium">{format(date, 'EEE, MMM d')}</p>
                          {isToday && (
                            <Badge variant="default" className="text-xs mt-1">Today</Badge>
                          )}
                        </div>
                        {record && statusBadge && (
                          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                        )}
                      </div>

                      {record && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          {isEditing ? (
                            <>
                              <div>
                                <label className="text-xs text-muted-foreground">Check In</label>
                                <Input
                                  type="time"
                                  value={editValues.checkIn ? format(parseISO(editValues.checkIn), 'HH:mm') : ''}
                                  onChange={(e) => {
                                    const [hours, minutes] = e.target.value.split(':');
                                    const newDate = parseISO(record.checkIn || new Date().toISOString());
                                    newDate.setHours(parseInt(hours), parseInt(minutes));
                                    setEditValues({ ...editValues, checkIn: newDate.toISOString() });
                                  }}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground">Check Out</label>
                                <Input
                                  type="time"
                                  value={editValues.checkOut ? format(parseISO(editValues.checkOut), 'HH:mm') : ''}
                                  onChange={(e) => {
                                    const [hours, minutes] = e.target.value.split(':');
                                    const newDate = parseISO(record.checkOut || new Date().toISOString());
                                    newDate.setHours(parseInt(hours), parseInt(minutes));
                                    setEditValues({ ...editValues, checkOut: newDate.toISOString() });
                                  }}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground">Status</label>
                                <Select
                                  value={editValues.status || record.status}
                                  onValueChange={(value) => setEditValues({ ...editValues, status: value as AttendanceStatus })}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="present">Present</SelectItem>
                                    <SelectItem value="late">Late</SelectItem>
                                    <SelectItem value="absent">Absent</SelectItem>
                                    <SelectItem value="half-day">Half Day</SelectItem>
                                    <SelectItem value="on-leave">On Leave</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground">Notes</label>
                                <Input
                                  value={editValues.notes || ''}
                                  onChange={(e) => setEditValues({ ...editValues, notes: e.target.value })}
                                  className="mt-1"
                                  placeholder="Add notes"
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <span className="text-xs text-muted-foreground">Check In</span>
                                <p className="font-medium">
                                  {record.checkIn ? format(parseISO(record.checkIn), 'h:mm a') : 'N/A'}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">Check Out</span>
                                <p className="font-medium">
                                  {record.checkOut ? format(parseISO(record.checkOut), 'h:mm a') : 'N/A'}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">Work Hours</span>
                                <p className="font-medium">{record.workHours.toFixed(2)}h</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">Overtime</span>
                                <p className="font-medium">{record.overtimeHours.toFixed(2)}h</p>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {!record && (
                        <p className="text-sm text-muted-foreground">No record for this day</p>
                      )}
                    </div>

                    {record && (
                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <Button size="sm" onClick={() => handleSave(record.id)}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancel}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(record.id, record)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
