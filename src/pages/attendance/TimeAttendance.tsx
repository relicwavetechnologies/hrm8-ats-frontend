import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Clock, Calendar, Users, TrendingUp, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { ClockInOut } from "@/modules/attendance/components/ClockInOut";
import { TimesheetView } from "@/modules/attendance/components/TimesheetView";
import { ShiftManagement } from "@/modules/attendance/components/ShiftManagement";
import { OvertimeManagement } from "@/modules/attendance/components/OvertimeManagement";
import { AttendanceReports } from "@/modules/attendance/components/AttendanceReports";
import { getAttendanceRecords, getOvertimeRequests } from "@/shared/lib/attendanceStorage";
import { startOfMonth, endOfMonth, format } from "date-fns";

export default function TimeAttendance() {
  const [activeTab, setActiveTab] = useState("clock");

  const currentMonth = useMemo(() => ({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  }), []);

  const records = useMemo(() => getAttendanceRecords(), []);
  const overtimeRequests = useMemo(() => getOvertimeRequests(), []);

  const stats = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayRecords = records.filter(r => r.date === today);
    const clockedIn = todayRecords.filter(r => r.checkIn && !r.checkOut).length;
    
    const monthRecords = records.filter(r => r.date >= currentMonth.start && r.date <= currentMonth.end);
    const presentDays = monthRecords.filter(r => ['present', 'late', 'half-day'].includes(r.status)).length;
    const absentDays = monthRecords.filter(r => r.status === 'absent').length;
    const lateDays = monthRecords.filter(r => r.status === 'late').length;
    
    const totalWorkHours = monthRecords.reduce((sum, r) => sum + r.workHours, 0);
    const totalOvertimeHours = monthRecords.reduce((sum, r) => sum + r.overtimeHours, 0);
    
    const pendingOvertime = overtimeRequests.filter(r => r.status === 'pending').length;

    return {
      clockedIn,
      presentDays,
      absentDays,
      lateDays,
      totalWorkHours: totalWorkHours.toFixed(1),
      totalOvertimeHours: totalOvertimeHours.toFixed(1),
      pendingOvertime,
    };
  }, [records, overtimeRequests, currentMonth]);

  return (
    <DashboardPageLayout>
      <Helmet>
        <title>Time & Attendance</title>
      </Helmet>

      <div className="container mx-auto p-6 space-y-6">
        <div className="text-base font-semibold flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Time & Attendance</h1>
            <p className="text-muted-foreground">Track time, manage shifts, and monitor attendance</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Clocked In Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.clockedIn}</div>
              <p className="text-xs text-muted-foreground mt-1">Employees currently working</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.presentDays}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Present days • {stats.lateDays} late
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Work Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWorkHours}h</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalOvertimeHours}h overtime
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                Pending OT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOvertime}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="clock">
              <Clock className="h-4 w-4 mr-2" />
              Clock In/Out
            </TabsTrigger>
            <TabsTrigger value="timesheet">
              <Calendar className="h-4 w-4 mr-2" />
              Timesheet
            </TabsTrigger>
            <TabsTrigger value="shifts">
              <Users className="h-4 w-4 mr-2" />
              Shifts
            </TabsTrigger>
            <TabsTrigger value="overtime">
              <TrendingUp className="h-4 w-4 mr-2" />
              Overtime
            </TabsTrigger>
            <TabsTrigger value="reports">
              <ClipboardList className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clock">
            <ClockInOut />
          </TabsContent>

          <TabsContent value="timesheet">
            <TimesheetView />
          </TabsContent>

          <TabsContent value="shifts">
            <ShiftManagement />
          </TabsContent>

          <TabsContent value="overtime">
            <OvertimeManagement />
          </TabsContent>

          <TabsContent value="reports">
            <AttendanceReports />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardPageLayout>
  );
}
