import { useState, useMemo } from "react";
import { Clock, LogIn, LogOut, MapPin, Wifi } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { useToast } from "@/shared/hooks/use-toast";
import { getAttendanceRecords, saveAttendanceRecord, updateAttendanceRecord, getShifts } from "@/shared/lib/attendanceStorage";
import { format, parseISO, differenceInMinutes, differenceInHours } from "date-fns";

export function ClockInOut() {
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useState(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  });

  const records = getAttendanceRecords();
  const shifts = getShifts();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Mock current employee
  const currentEmployee = {
    id: 'emp-001',
    name: 'Current User',
    shiftId: shifts[0]?.id || 'shift-1',
  };

  const todayRecord = useMemo(() => {
    return records.find(r => 
      r.employeeId === currentEmployee.id && 
      r.date === today
    );
  }, [records, today, currentEmployee.id]);

  const currentShift = shifts.find(s => s.id === currentEmployee.shiftId);
  const isClockedIn = todayRecord && todayRecord.checkIn && !todayRecord.checkOut;

  const calculateWorkHours = (checkIn: string, checkOut: string) => {
    const diff = differenceInMinutes(parseISO(checkOut), parseISO(checkIn));
    const breakDuration = currentShift?.breakDuration || 0;
    return Math.max(0, (diff - breakDuration) / 60);
  };

  const calculateLateMinutes = (checkIn: string) => {
    if (!currentShift) return 0;
    const [hours, minutes] = currentShift.startTime.split(':').map(Number);
    const shiftStart = new Date(checkIn);
    shiftStart.setHours(hours, minutes, 0, 0);
    const actualCheckIn = parseISO(checkIn);
    const gracePeriod = currentShift.gracePeriod || 0;
    const lateMins = differenceInMinutes(actualCheckIn, shiftStart) - gracePeriod;
    return Math.max(0, lateMins);
  };

  const handleClockIn = async () => {
    if (isClockedIn) {
      toast({
        title: "Already Clocked In",
        description: "You are already clocked in for today",
        variant: "destructive",
      });
      return;
    }

    const now = new Date().toISOString();
    const lateMinutes = calculateLateMinutes(now);

    if (todayRecord) {
      // Update existing record
      updateAttendanceRecord(todayRecord.id, {
        checkIn: now,
        status: lateMinutes > 0 ? 'late' : 'present',
        lateMinutes,
      });
    } else {
      // Create new record
      saveAttendanceRecord({
        employeeId: currentEmployee.id,
        employeeName: currentEmployee.name,
        date: today,
        shiftId: currentEmployee.shiftId,
        shiftName: currentShift?.name || 'Default Shift',
        checkIn: now,
        status: lateMinutes > 0 ? 'late' : 'present',
        workHours: 0,
        overtimeHours: 0,
        lateMinutes,
        earlyDepartureMinutes: 0,
        location: 'Office',
        ipAddress: '192.168.1.1',
      });
    }

    toast({
      title: "Clocked In",
      description: lateMinutes > 0 
        ? `You are ${lateMinutes} minutes late` 
        : "Have a productive day!",
    });
  };

  const handleClockOut = () => {
    if (!todayRecord || !todayRecord.checkIn) {
      toast({
        title: "Not Clocked In",
        description: "You need to clock in first",
        variant: "destructive",
      });
      return;
    }

    const now = new Date().toISOString();
    const workHours = calculateWorkHours(todayRecord.checkIn, now);
    
    // Calculate if early departure (assuming 8-hour workday)
    const expectedWorkHours = 8;
    const earlyDepartureMinutes = workHours < expectedWorkHours 
      ? Math.round((expectedWorkHours - workHours) * 60) 
      : 0;

    updateAttendanceRecord(todayRecord.id, {
      checkOut: now,
      workHours,
      earlyDepartureMinutes,
    });

    toast({
      title: "Clocked Out",
      description: `You worked ${workHours.toFixed(2)} hours today`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Clock Display */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Clock className="h-16 w-16 mx-auto text-primary" />
            <div className="space-y-2">
              <div className="text-5xl font-bold tabular-nums">
                {format(currentTime, 'HH:mm:ss')}
              </div>
              <div className="text-lg text-muted-foreground">
                {format(currentTime, 'EEEE, MMMM d, yyyy')}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                size="lg"
                onClick={handleClockIn}
                disabled={isClockedIn}
                className="min-w-[150px]"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Clock In
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleClockOut}
                disabled={!isClockedIn}
                className="min-w-[150px]"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Clock Out
              </Button>
            </div>

            {isClockedIn && todayRecord && (
              <div className="pt-4 space-y-2">
                <Badge variant="default" className="text-sm">Currently Clocked In</Badge>
                <p className="text-sm text-muted-foreground">
                  Started at {format(parseISO(todayRecord.checkIn!), 'h:mm a')} • 
                  Working for {differenceInHours(new Date(), parseISO(todayRecord.checkIn!))} hours
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Today's Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Shift</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-lg font-semibold">{currentShift?.name || 'No Shift'}</p>
              {currentShift && (
                <p className="text-sm text-muted-foreground">
                  {currentShift.startTime} - {currentShift.endTime}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayRecord ? (
                <>
                  <Badge variant={
                    todayRecord.status === 'present' ? 'outline' :
                    todayRecord.status === 'late' ? 'destructive' : 'secondary'
                  }>
                    {todayRecord.status.toUpperCase()}
                  </Badge>
                  {todayRecord.lateMinutes > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {todayRecord.lateMinutes} min late
                    </p>
                  )}
                </>
              ) : (
                <Badge variant="secondary">Not Recorded</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{todayRecord?.location || 'Not checked in'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Wifi className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {todayRecord?.ipAddress || 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {records
              .filter(r => r.employeeId === currentEmployee.id)
              .slice(0, 5)
              .map((record) => (
                <div key={record.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="space-y-1">
                    <p className="font-medium">{format(parseISO(record.date), 'EEEE, MMM d')}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>In: {record.checkIn ? format(parseISO(record.checkIn), 'h:mm a') : 'N/A'}</span>
                      <span>•</span>
                      <span>Out: {record.checkOut ? format(parseISO(record.checkOut), 'h:mm a') : 'N/A'}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={
                      record.status === 'present' ? 'outline' :
                      record.status === 'late' ? 'destructive' : 'secondary'
                    }>
                      {record.status}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {record.workHours.toFixed(1)}h
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
