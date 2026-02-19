import { useState, useMemo } from "react";
import { BarChart3, Download, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { getAttendanceRecords, calculateAttendanceStats } from "@/shared/lib/attendanceStorage";
import { Label } from "@/shared/components/ui/label";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { cn } from "@/shared/lib/utils";

export function AttendanceReports() {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");

  const records = getAttendanceRecords();

  // Get unique employees
  const employees = useMemo(() => {
    const uniqueEmployees = Array.from(new Set(records.map(r => r.employeeId)))
      .map(id => {
        const record = records.find(r => r.employeeId === id);
        return { id, name: record?.employeeName || 'Unknown' };
      });
    return uniqueEmployees;
  }, [records]);

  const reportData = useMemo(() => {
    const startStr = format(startDate, 'yyyy-MM-dd');
    const endStr = format(endDate, 'yyyy-MM-dd');

    if (selectedEmployee === "all") {
      // Overall stats
      const filteredRecords = records.filter(r => r.date >= startStr && r.date <= endStr);
      const totalEmployees = new Set(filteredRecords.map(r => r.employeeId)).size;
      const presentDays = filteredRecords.filter(r => ['present', 'late', 'half-day'].includes(r.status)).length;
      const absentDays = filteredRecords.filter(r => r.status === 'absent').length;
      const lateDays = filteredRecords.filter(r => r.status === 'late').length;
      const totalWorkHours = filteredRecords.reduce((sum, r) => sum + r.workHours, 0);
      const totalOvertimeHours = filteredRecords.reduce((sum, r) => sum + r.overtimeHours, 0);
      const attendanceRate = filteredRecords.length > 0 ? (presentDays / filteredRecords.length) * 100 : 0;

      return {
        totalEmployees,
        totalDays: filteredRecords.length,
        presentDays,
        absentDays,
        lateDays,
        totalWorkHours,
        totalOvertimeHours,
        attendanceRate,
      };
    } else {
      // Individual employee stats
      const stats = calculateAttendanceStats(selectedEmployee, startStr, endStr);
      return {
        ...stats,
        totalEmployees: 1,
      };
    }
  }, [records, startDate, endDate, selectedEmployee]);

  const handleExport = () => {
    // Mock export functionality
    const csv = `Attendance Report,${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}\n`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {format(startDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {format(endDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Employee</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleExport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalDays}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Present Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.presentDays}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {reportData.attendanceRate.toFixed(1)}% attendance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Work Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalWorkHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total work time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Overtime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalOvertimeHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground mt-1">
              Extra hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Present Days</p>
                <p className="text-2xl font-bold">{reportData.presentDays}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Absent Days</p>
                <p className="text-2xl font-bold">{reportData.absentDays}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Late Days</p>
                <p className="text-2xl font-bold">{reportData.lateDays}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-2xl font-bold">{reportData.attendanceRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
